import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod/v4";

import {
  CreateProductMediaSchema,
  CreateProductSchema,
  Product,
  ProductMedia,
  UpdateProductSchema,
} from "@caixa/db/schema";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

const idInput = z.object({ id: z.string().uuid() });

export const productRouter = createTRPCRouter({
  /** Public catalog — top-level products (no parent), not hidden */
  catalog: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.Product.findMany({
      where: and(eq(Product.hidden, false), isNull(Product.parentId)),
      orderBy: [desc(Product.createdAt)],
      with: {
        media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
      },
    });
    return rows;
  }),

  /** Public detail by slug with children + media */
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.Product.findFirst({
        where: and(eq(Product.slug, input.slug), eq(Product.hidden, false)),
        with: {
          media: { orderBy: asc(ProductMedia.sortOrder) },
          children: {
            where: eq(Product.hidden, false),
            with: {
              media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
            },
          },
        },
      });
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  /** Fetch many by id (used by cart to resync prices/availability) */
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
  adminAll: adminProcedure.query(({ ctx }) =>
    ctx.db.query.Product.findMany({
      orderBy: [desc(Product.createdAt)],
      with: {
        media: { orderBy: asc(ProductMedia.sortOrder), limit: 1 },
        parent: true,
      },
    }),
  ),

  adminById: adminProcedure.input(idInput).query(async ({ ctx, input }) => {
    const row = await ctx.db.query.Product.findFirst({
      where: eq(Product.id, input.id),
      with: {
        media: { orderBy: asc(ProductMedia.sortOrder) },
        children: true,
      },
    });
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    return row;
  }),

  create: adminProcedure
    .input(CreateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(Product).values(input).returning();
      return row;
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), patch: UpdateProductSchema }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(Product)
        .set(input.patch)
        .where(eq(Product.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
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
