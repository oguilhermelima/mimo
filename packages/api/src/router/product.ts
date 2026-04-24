import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gt, inArray, ne } from "drizzle-orm";
import { z } from "zod/v4";

import {
  CreateProductMediaSchema,
  CreateProductSchema,
  PRODUCT_TYPES,
  PriceHistory,
  Product,
  ProductMedia,
  UpdateProductSchema,
} from "@caixa/db/schema";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

const idInput = z.object({ id: z.string().uuid() });

export const productRouter = createTRPCRouter({
  /** Public catalog — all visible products, optional type filter */
  catalog: publicProcedure
    .input(z.object({ type: z.enum(PRODUCT_TYPES).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const filters = [eq(Product.hidden, false)];
      if (input?.type) filters.push(eq(Product.type, input.type));

      return ctx.db.query.Product.findMany({
        where: and(...filters),
        orderBy: [desc(Product.createdAt)],
        with: {
          media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
        },
      });
    }),

  /** Public detail by slug (no composition — composition lives on bundles) */
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.Product.findFirst({
        where: and(eq(Product.slug, input.slug), eq(Product.hidden, false)),
        with: {
          media: { orderBy: asc(ProductMedia.sortOrder) },
        },
      });
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  /** Template boxes disponíveis pra /encomenda (ignora hidden, filtra estoque). */
  publicTemplateBoxes: publicProcedure.query(({ ctx }) =>
    ctx.db.query.Product.findMany({
      where: and(eq(Product.type, "template_box"), gt(Product.quantity, 0)),
      orderBy: [desc(Product.createdAt)],
      with: {
        media: { orderBy: asc(ProductMedia.sortOrder) },
      },
    }),
  ),

  /** Produtos selecionáveis pra preencher uma encomenda (sem shells). */
  publicContents: publicProcedure.query(({ ctx }) =>
    ctx.db.query.Product.findMany({
      where: and(
        ne(Product.type, "template_box"),
        eq(Product.hidden, false),
        gt(Product.quantity, 0),
      ),
      orderBy: [desc(Product.createdAt)],
      with: {
        media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
      },
    }),
  ),

  /** Batch fetch by ids (cart resync) */
  byIds: publicProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .query(async ({ ctx, input }) => {
      if (input.ids.length === 0) return [];
      return ctx.db.query.Product.findMany({
        where: and(inArray(Product.id, input.ids), eq(Product.hidden, false)),
        with: {
          media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
        },
      });
    }),

  /* ── admin ── */
  adminAll: adminProcedure
    .input(z.object({ type: z.enum(PRODUCT_TYPES).optional() }).optional())
    .query(({ ctx, input }) => {
      const where = input?.type ? eq(Product.type, input.type) : undefined;
      return ctx.db.query.Product.findMany({
        where,
        orderBy: [desc(Product.createdAt)],
        with: {
          media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
        },
      });
    }),

  adminById: adminProcedure.input(idInput).query(async ({ ctx, input }) => {
    const row = await ctx.db.query.Product.findFirst({
      where: eq(Product.id, input.id),
      with: {
        media: { orderBy: asc(ProductMedia.sortOrder) },
      },
    });
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    return row;
  }),

  create: adminProcedure
    .input(CreateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(Product).values(input).returning();
      if (!row) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (typeof row.priceCents === "number") {
        await ctx.db.insert(PriceHistory).values({
          entityType: "product",
          entityId: row.id,
          priceCents: row.priceCents,
        });
      }
      return row;
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), patch: UpdateProductSchema }))
    .mutation(async ({ ctx, input }) => {
      const before = await ctx.db.query.Product.findFirst({
        where: eq(Product.id, input.id),
      });
      if (!before) throw new TRPCError({ code: "NOT_FOUND" });

      const [row] = await ctx.db
        .update(Product)
        .set(input.patch)
        .where(eq(Product.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });

      if (
        typeof row.priceCents === "number" &&
        row.priceCents !== before.priceCents
      ) {
        await ctx.db.insert(PriceHistory).values({
          entityType: "product",
          entityId: row.id,
          priceCents: row.priceCents,
        });
      }
      return row;
    }),

  delete: adminProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(Product).where(eq(Product.id, input.id));
    return { ok: true };
  }),

  toggleHidden: adminProcedure
    .input(z.object({ id: z.string().uuid(), hidden: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(Product)
        .set({ hidden: input.hidden })
        .where(eq(Product.id, input.id));
      return { ok: true };
    }),

  /* ── media ── */
  addMedia: adminProcedure
    .input(CreateProductMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(ProductMedia).values(input).returning();
      return row;
    }),

  removeMedia: adminProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(ProductMedia).where(eq(ProductMedia.id, input.id));
    return { ok: true };
  }),
});
