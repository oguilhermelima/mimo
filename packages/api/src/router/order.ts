import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod/v4";

import {
  Address,
  Bundle,
  BundleItem,
  Coupon,
  Order,
  OrderItem,
  ORDER_STATUSES,
  Product,
  Stamp,
  User,
  type FulfillmentMethod,
  type PaymentMethod,
} from "@caixa/db/schema";
import { checkoutSchema } from "@caixa/validators";

import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

const idInput = z.object({ id: z.string().uuid() });

const RESERVATION_HOURS = 12;
const reservedUntilFromNow = () =>
  new Date(Date.now() + RESERVATION_HOURS * 60 * 60 * 1000);

/**
 * orderRouter: checkout cria Order com status "reservado", trava estoque por 12h,
 * snapshot de preço/endereço/cliente. Admin gera pgto via WhatsApp depois.
 */
export const orderRouter = createTRPCRouter({
  /* ────────── public-side (autenticado) ────────── */

  create: protectedProcedure
    .input(checkoutSchema)
    .mutation(async ({ ctx, input }) => {
      const me = await ctx.db.query.User.findFirst({
        where: eq(User.id, ctx.user.id),
      });
      if (!me) throw new TRPCError({ code: "UNAUTHORIZED" });

      const meCpf = me.cpf;
      const mePhone = me.phone;
      if (!meCpf) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "preencha CPF no perfil antes de finalizar a compra",
        });
      }
      if (!mePhone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "preencha telefone no perfil antes de finalizar a compra",
        });
      }

      let addressSnapshot: {
        recipientName: string;
        postalCode: string;
        street: string;
        number: string;
        complement: string | null;
        district: string;
        city: string;
        state: string;
        country: string;
      } | null = null;

      if (input.fulfillmentMethod === "delivery") {
        if (!input.addressId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "endereço obrigatório para entrega",
          });
        }
        const addr = await ctx.db.query.Address.findFirst({
          where: and(
            eq(Address.id, input.addressId),
            eq(Address.userId, ctx.user.id),
          ),
        });
        if (!addr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "endereço não encontrado",
          });
        }
        addressSnapshot = {
          recipientName: addr.recipientName,
          postalCode: addr.postalCode,
          street: addr.street,
          number: addr.number,
          complement: addr.complement,
          district: addr.district,
          city: addr.city,
          state: addr.state,
          country: addr.country,
        };
      }

      return ctx.db.transaction(async (tx) => {
        let subtotalCents = 0;

        type StagedLine = {
          kind: "product" | "bundle" | "custom_box";
          productId: string | null;
          bundleId: string | null;
          titleSnapshot: string;
          priceCentsSnapshot: number;
          quantity: number;
        };
        const staged: StagedLine[] = [];

        for (const line of input.items) {
          if (line.kind === "product") {
            const [row] = await tx
              .select()
              .from(Product)
              .where(eq(Product.id, line.productId))
              .for("update");
            if (!row || row.hidden) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "produto indisponível",
              });
            }
            if (row.priceCents == null) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `${row.title} está sob consulta — não dá pra comprar pelo site`,
              });
            }
            if (row.quantity < line.quantity) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Estoque insuficiente para ${row.title}`,
              });
            }
            await tx
              .update(Product)
              .set({ quantity: row.quantity - line.quantity })
              .where(eq(Product.id, row.id));

            subtotalCents += row.priceCents * line.quantity;
            staged.push({
              kind: "product",
              productId: row.id,
              bundleId: null,
              titleSnapshot: row.title,
              priceCentsSnapshot: row.priceCents,
              quantity: line.quantity,
            });
          } else if (line.kind === "bundle") {
            const [row] = await tx
              .select()
              .from(Bundle)
              .where(eq(Bundle.id, line.bundleId))
              .for("update");
            if (!row || row.hidden || row.source !== "catalog") {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "caixa indisponível",
              });
            }
            const items = await tx.query.BundleItem.findMany({
              where: eq(BundleItem.bundleId, row.id),
              with: { product: true },
            });
            const effective =
              row.priceCents ??
              items.reduce(
                (sum, it) =>
                  sum + (it.product.priceCents ?? 0) * it.quantity,
                0,
              );
            if (effective <= 0) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `${row.title} está sem preço definido`,
              });
            }
            if (row.quantity < line.quantity) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Estoque insuficiente para ${row.title}`,
              });
            }
            await tx
              .update(Bundle)
              .set({ quantity: row.quantity - line.quantity })
              .where(eq(Bundle.id, row.id));

            subtotalCents += effective * line.quantity;
            staged.push({
              kind: "bundle",
              productId: null,
              bundleId: row.id,
              titleSnapshot: row.title,
              priceCentsSnapshot: effective,
              quantity: line.quantity,
            });
          } else {
            const composition = line.customBox;
            const totalUnits = line.quantity;

            const [template] = await tx
              .select()
              .from(Product)
              .where(eq(Product.id, composition.templateBoxId))
              .for("update");
            if (
              !template ||
              template.hidden ||
              template.type !== "template_box"
            ) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "caixa base indisponível",
              });
            }
            if (template.priceCents == null) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `${template.title} está sob consulta`,
              });
            }
            if (template.quantity < totalUnits) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: `Estoque insuficiente da caixa ${template.title}`,
              });
            }
            await tx
              .update(Product)
              .set({ quantity: template.quantity - totalUnits })
              .where(eq(Product.id, template.id));

            let stampRow: typeof Stamp.$inferSelect | null = null;
            if (composition.stampId) {
              const [s] = await tx
                .select()
                .from(Stamp)
                .where(eq(Stamp.id, composition.stampId))
                .for("update");
              if (!s || s.hidden) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "estampa indisponível",
                });
              }
              if (s.quantity < totalUnits) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Estoque insuficiente da estampa ${s.name}`,
                });
              }
              await tx
                .update(Stamp)
                .set({ quantity: s.quantity - totalUnits })
                .where(eq(Stamp.id, s.id));
              stampRow = s;
            }

            let composedPrice =
              template.priceCents + (stampRow?.priceCents ?? 0);

            for (const it of composition.items) {
              const [child] = await tx
                .select()
                .from(Product)
                .where(eq(Product.id, it.productId))
                .for("update");
              if (!child || child.hidden) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "um dos itens da caixa está indisponível",
                });
              }
              if (child.priceCents == null) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `${child.title} está sob consulta`,
                });
              }
              const need = it.quantity * totalUnits;
              if (child.quantity < need) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Estoque insuficiente de ${child.title}`,
                });
              }
              await tx
                .update(Product)
                .set({ quantity: child.quantity - need })
                .where(eq(Product.id, child.id));
              composedPrice += child.priceCents * it.quantity;
            }

            const [createdBundle] = await tx
              .insert(Bundle)
              .values({
                source: "user_order",
                title: `Encomenda — ${template.title}`,
                templateBoxId: template.id,
                stampId: stampRow?.id ?? null,
                priceCents: composedPrice,
                quantity: 1,
                customerName: me.name,
                customerNote: input.customerNote ?? null,
              })
              .returning();
            if (!createdBundle) {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }

            if (composition.items.length > 0) {
              await tx.insert(BundleItem).values(
                composition.items.map((it, i) => ({
                  bundleId: createdBundle.id,
                  productId: it.productId,
                  quantity: it.quantity,
                  sortOrder: i,
                })),
              );
            }

            subtotalCents += composedPrice * totalUnits;
            staged.push({
              kind: "custom_box",
              productId: null,
              bundleId: createdBundle.id,
              titleSnapshot: createdBundle.title,
              priceCentsSnapshot: composedPrice,
              quantity: totalUnits,
            });
          }

        }

        let discountCents = 0;
        let couponId: string | null = null;
        let couponCodeSnapshot: string | null = null;

        if (input.couponCode) {
          const code = input.couponCode.toUpperCase();
          const [coupon] = await tx
            .select()
            .from(Coupon)
            .where(eq(Coupon.code, code))
            .for("update");
          if (!coupon || !coupon.active) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "cupom inválido",
            });
          }
          const now = new Date();
          if (coupon.validFrom && coupon.validFrom > now) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "cupom ainda não vigente",
            });
          }
          if (coupon.validTo && coupon.validTo < now) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "cupom expirado",
            });
          }
          if (
            typeof coupon.maxUses === "number" &&
            coupon.usedCount >= coupon.maxUses
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "cupom esgotado",
            });
          }
          if (coupon.scope !== "global") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "cupom não suportado neste checkout (use cupom global)",
            });
          }
          discountCents =
            coupon.discountType === "percent"
              ? Math.floor((subtotalCents * coupon.discountValue) / 100)
              : Math.min(subtotalCents, coupon.discountValue);

          await tx
            .update(Coupon)
            .set({ usedCount: coupon.usedCount + 1 })
            .where(eq(Coupon.id, coupon.id));
          couponId = coupon.id;
          couponCodeSnapshot = coupon.code;
        }

        const totalCents = Math.max(0, subtotalCents - discountCents);

        const [order] = await tx
          .insert(Order)
          .values({
            userId: ctx.user.id,
            status: "reservado",
            fulfillmentMethod: input.fulfillmentMethod as FulfillmentMethod,
            deliverRecipientName: addressSnapshot?.recipientName ?? null,
            deliverPostalCode: addressSnapshot?.postalCode ?? null,
            deliverStreet: addressSnapshot?.street ?? null,
            deliverNumber: addressSnapshot?.number ?? null,
            deliverComplement: addressSnapshot?.complement ?? null,
            deliverDistrict: addressSnapshot?.district ?? null,
            deliverCity: addressSnapshot?.city ?? null,
            deliverState: addressSnapshot?.state ?? null,
            deliverCountry: addressSnapshot?.country ?? null,
            customerName: me.name,
            customerEmail: me.email,
            customerPhone: mePhone,
            customerCpf: meCpf,
            customerNote: input.customerNote ?? null,
            paymentMethod: input.paymentMethod as PaymentMethod,
            subtotalCents,
            discountCents,
            totalCents,
            couponId,
            couponCodeSnapshot,
            reservedUntil: reservedUntilFromNow(),
          })
          .returning();
        if (!order) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await tx.insert(OrderItem).values(
          staged.map((s, i) => ({
            orderId: order.id,
            kind: s.kind,
            productId: s.productId,
            bundleId: s.bundleId,
            titleSnapshot: s.titleSnapshot,
            priceCentsSnapshot: s.priceCentsSnapshot,
            quantity: s.quantity,
            sortOrder: i,
          })),
        );

        return order;
      });
    }),

  myOrders: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.Order.findMany({
      where: eq(Order.userId, ctx.user.id),
      orderBy: [desc(Order.createdAt)],
      with: {
        items: { orderBy: asc(OrderItem.sortOrder) },
      },
    }),
  ),

  byId: protectedProcedure.input(idInput).query(async ({ ctx, input }) => {
    const order = await ctx.db.query.Order.findFirst({
      where: eq(Order.id, input.id),
      with: {
        items: {
          orderBy: asc(OrderItem.sortOrder),
          with: {
            product: { with: { media: true } },
            bundle: {
              with: {
                templateBox: true,
                stamp: true,
                items: {
                  orderBy: asc(BundleItem.sortOrder),
                  with: { product: true },
                },
              },
            },
          },
        },
      },
    });
    if (!order) throw new TRPCError({ code: "NOT_FOUND" });
    if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    return order;
  }),

  /* ────────── admin ────────── */

  adminAll: adminProcedure
    .input(
      z
        .object({
          status: z.enum(ORDER_STATUSES).optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) =>
      ctx.db.query.Order.findMany({
        where: input?.status ? eq(Order.status, input.status) : undefined,
        orderBy: [desc(Order.createdAt)],
        with: {
          items: { orderBy: asc(OrderItem.sortOrder) },
        },
      }),
    ),

  adminById: adminProcedure
    .input(idInput)
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.Order.findFirst({
        where: eq(Order.id, input.id),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              phone: true,
              cpf: true,
            },
          },
          items: {
            orderBy: asc(OrderItem.sortOrder),
            with: {
              product: true,
              bundle: {
                with: {
                  templateBox: true,
                  stamp: true,
                  items: {
                    orderBy: asc(BundleItem.sortOrder),
                    with: { product: true },
                  },
                },
              },
            },
          },
        },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),

  adminMarkPaid: adminProcedure
    .input(idInput)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(Order)
        .set({ status: "pago", paidAt: sql`now()` })
        .where(eq(Order.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  adminMarkFulfilled: adminProcedure
    .input(idInput)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(Order)
        .set({ status: "entregue", fulfilledAt: sql`now()` })
        .where(eq(Order.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  adminCancel: adminProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const order = await tx.query.Order.findFirst({
          where: eq(Order.id, input.id),
          with: {
            items: {
              with: {
                bundle: {
                  with: {
                    items: true,
                  },
                },
              },
            },
          },
        });
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        if (order.status === "cancelado" || order.status === "entregue") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "pedido já finalizado",
          });
        }

        // Restock cada item conforme kind
        for (const it of order.items) {
          if (it.kind === "product" && it.productId) {
            await tx
              .update(Product)
              .set({ quantity: sql`${Product.quantity} + ${it.quantity}` })
              .where(eq(Product.id, it.productId));
          } else if (it.kind === "bundle" && it.bundleId) {
            await tx
              .update(Bundle)
              .set({ quantity: sql`${Bundle.quantity} + ${it.quantity}` })
              .where(eq(Bundle.id, it.bundleId));
          } else if (it.kind === "custom_box" && it.bundleId && it.bundle) {
            const totalUnits = it.quantity;
            if (it.bundle.templateBoxId) {
              await tx
                .update(Product)
                .set({
                  quantity: sql`${Product.quantity} + ${totalUnits}`,
                })
                .where(eq(Product.id, it.bundle.templateBoxId));
            }
            if (it.bundle.stampId) {
              await tx
                .update(Stamp)
                .set({ quantity: sql`${Stamp.quantity} + ${totalUnits}` })
                .where(eq(Stamp.id, it.bundle.stampId));
            }
            for (const child of it.bundle.items) {
              await tx
                .update(Product)
                .set({
                  quantity: sql`${Product.quantity} + ${child.quantity * totalUnits}`,
                })
                .where(eq(Product.id, child.productId));
            }
          }
        }

        if (order.couponId) {
          await tx
            .update(Coupon)
            .set({ usedCount: sql`GREATEST(${Coupon.usedCount} - 1, 0)` })
            .where(eq(Coupon.id, order.couponId));
        }

        const [row] = await tx
          .update(Order)
          .set({
            status: "cancelado",
            cancelledAt: sql`now()`,
            cancellationReason: input.reason ?? null,
          })
          .where(eq(Order.id, input.id))
          .returning();
        return row;
      });
    }),
});
