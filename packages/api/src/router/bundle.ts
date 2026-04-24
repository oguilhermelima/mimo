import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { z } from "zod/v4";

import {
  Bundle,
  BundleItem,
  BundleMedia,
  CreateBundleMediaSchema,
  CreateBundleSchema,
  PriceHistory,
  Product,
  ProductMedia,
  UpdateBundleSchema,
} from "@caixa/db/schema";
import { customOrderSchema } from "@caixa/validators";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

const idInput = z.object({ id: z.string().uuid() });

function effectivePrice(
  bundlePrice: number | null,
  items: { quantity: number; product: { priceCents: number | null } }[],
) {
  if (typeof bundlePrice === "number") return bundlePrice;
  return items.reduce(
    (sum, it) => sum + (it.product.priceCents ?? 0) * it.quantity,
    0,
  );
}

export const bundleRouter = createTRPCRouter({
  /** Public: caixas prontas */
  catalogList: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.Bundle.findMany({
      where: and(eq(Bundle.source, "catalog"), eq(Bundle.hidden, false)),
      orderBy: [desc(Bundle.createdAt)],
      with: {
        templateBox: {
          with: {
            media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
          },
        },
        stamp: true,
        media: { orderBy: asc(BundleMedia.sortOrder) },
        items: {
          orderBy: asc(BundleItem.sortOrder),
          with: {
            product: {
              with: {
                media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
              },
            },
          },
        },
      },
    });
    return rows.map((b) => ({
      ...b,
      effectivePriceCents: effectivePrice(b.priceCents, b.items),
    }));
  }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const bundle = await ctx.db.query.Bundle.findFirst({
        where: and(
          eq(Bundle.slug, input.slug),
          eq(Bundle.source, "catalog"),
          eq(Bundle.hidden, false),
        ),
        with: {
          templateBox: {
            with: {
              media: { orderBy: asc(ProductMedia.sortOrder) },
            },
          },
          stamp: true,
          media: { orderBy: asc(BundleMedia.sortOrder) },
          items: {
            orderBy: asc(BundleItem.sortOrder),
            with: {
              product: {
                with: {
                  media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
                },
              },
            },
          },
        },
      });
      if (!bundle) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        ...bundle,
        effectivePriceCents: effectivePrice(bundle.priceCents, bundle.items),
      };
    }),

  byIds: publicProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .query(async ({ ctx, input }) => {
      if (input.ids.length === 0) return [];
      const rows = await ctx.db.query.Bundle.findMany({
        where: and(
          inArray(Bundle.id, input.ids),
          eq(Bundle.source, "catalog"),
          eq(Bundle.hidden, false),
        ),
        with: {
          templateBox: {
            with: {
              media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
            },
          },
          stamp: true,
          items: {
            orderBy: asc(BundleItem.sortOrder),
            with: { product: true },
          },
        },
      });
      return rows.map((b) => ({
        ...b,
        effectivePriceCents: effectivePrice(b.priceCents, b.items),
      }));
    }),

  /* ── admin ── */
  adminAll: adminProcedure.query(({ ctx }) =>
    ctx.db.query.Bundle.findMany({
      orderBy: [desc(Bundle.createdAt)],
      with: {
        templateBox: true,
        stamp: true,
        items: {
          orderBy: asc(BundleItem.sortOrder),
          with: { product: true },
        },
      },
    }),
  ),

  adminById: adminProcedure.input(idInput).query(async ({ ctx, input }) => {
    const bundle = await ctx.db.query.Bundle.findFirst({
      where: eq(Bundle.id, input.id),
      with: {
        templateBox: true,
        stamp: true,
        media: { orderBy: asc(BundleMedia.sortOrder) },
        items: {
          orderBy: asc(BundleItem.sortOrder),
          with: { product: true },
        },
      },
    });
    if (!bundle) throw new TRPCError({ code: "NOT_FOUND" });
    return bundle;
  }),

  create: adminProcedure
    .input(CreateBundleSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...fields } = input;
      const [row] = await ctx.db.insert(Bundle).values(fields).returning();
      if (!row) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      if (items.length > 0) {
        await ctx.db.insert(BundleItem).values(
          items.map((it, i) => ({
            bundleId: row.id,
            productId: it.productId,
            quantity: it.quantity,
            sortOrder: it.sortOrder ?? i,
          })),
        );
      }

      if (typeof row.priceCents === "number") {
        await ctx.db.insert(PriceHistory).values({
          entityType: "bundle",
          entityId: row.id,
          priceCents: row.priceCents,
        });
      }
      return row;
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), patch: UpdateBundleSchema }))
    .mutation(async ({ ctx, input }) => {
      const before = await ctx.db.query.Bundle.findFirst({
        where: eq(Bundle.id, input.id),
      });
      if (!before) throw new TRPCError({ code: "NOT_FOUND" });

      const { items, ...fields } = input.patch;
      const [row] = await ctx.db
        .update(Bundle)
        .set(fields)
        .where(eq(Bundle.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });

      if (items) {
        await ctx.db.delete(BundleItem).where(eq(BundleItem.bundleId, row.id));
        if (items.length > 0) {
          await ctx.db.insert(BundleItem).values(
            items.map((it, i) => ({
              bundleId: row.id,
              productId: it.productId,
              quantity: it.quantity,
              sortOrder: it.sortOrder ?? i,
            })),
          );
        }
      }

      if (
        typeof row.priceCents === "number" &&
        row.priceCents !== before.priceCents
      ) {
        await ctx.db.insert(PriceHistory).values({
          entityType: "bundle",
          entityId: row.id,
          priceCents: row.priceCents,
        });
      }
      return row;
    }),

  delete: adminProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(Bundle).where(eq(Bundle.id, input.id));
    return { ok: true };
  }),

  toggleHidden: adminProcedure
    .input(z.object({ id: z.string().uuid(), hidden: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(Bundle)
        .set({ hidden: input.hidden })
        .where(eq(Bundle.id, input.id));
      return { ok: true };
    }),

  /* ── media ── */
  addMedia: adminProcedure
    .input(CreateBundleMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(BundleMedia).values(input).returning();
      return row;
    }),

  removeMedia: adminProcedure
    .input(idInput)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(BundleMedia).where(eq(BundleMedia.id, input.id));
      return { ok: true };
    }),

  /* ── encomenda (user_order) ── */
  createUserOrder: publicProcedure
    .input(customOrderSchema)
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.db.query.Product.findFirst({
        where: and(
          eq(Product.id, input.templateBoxId),
          eq(Product.type, "template_box"),
        ),
      });
      if (!template)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "template_box inválido",
        });

      const contentIds = input.items.map((i) => i.productId);
      if (contentIds.length > 0) {
        const products = await ctx.db.query.Product.findMany({
          where: and(
            inArray(Product.id, contentIds),
            eq(Product.hidden, false),
            gt(Product.quantity, 0),
          ),
        });
        if (products.length !== contentIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "um ou mais produtos indisponíveis",
          });
        }
      }

      const [bundle] = await ctx.db
        .insert(Bundle)
        .values({
          source: "user_order",
          title: `Encomenda — ${input.customerName}`,
          templateBoxId: input.templateBoxId,
          stampId: input.stampId,
          customerName: input.customerName,
          customerNote: input.customerNote ?? null,
          quantity: 1,
        })
        .returning();
      if (!bundle) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await ctx.db.insert(BundleItem).values(
        input.items.map((it, i) => ({
          bundleId: bundle.id,
          productId: it.productId,
          quantity: it.quantity,
          sortOrder: i,
        })),
      );

      const detail = await ctx.db.query.Bundle.findFirst({
        where: eq(Bundle.id, bundle.id),
        with: {
          templateBox: true,
          stamp: true,
          items: {
            orderBy: asc(BundleItem.sortOrder),
            with: { product: true },
          },
        },
      });
      if (!detail) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return {
        ...detail,
        effectivePriceCents: effectivePrice(detail.priceCents, detail.items),
      };
    }),
});
