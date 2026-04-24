import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { z } from "zod/v4";

import {
  CreateStampSchema,
  PriceHistory,
  Stamp,
  UpdateStampSchema,
} from "@caixa/db/schema";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

const idInput = z.object({ id: z.string().uuid() });

export const stampRouter = createTRPCRouter({
  /** Public: stamps disponíveis (não ocultas + estoque positivo) */
  listAvailable: publicProcedure.query(({ ctx }) =>
    ctx.db.query.Stamp.findMany({
      where: and(eq(Stamp.hidden, false), gt(Stamp.quantity, 0)),
      orderBy: [desc(Stamp.createdAt)],
    }),
  ),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.Stamp.findFirst({
        where: and(eq(Stamp.slug, input.slug), eq(Stamp.hidden, false)),
      });
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  /* ── admin ── */
  adminAll: adminProcedure.query(({ ctx }) =>
    ctx.db.query.Stamp.findMany({ orderBy: [desc(Stamp.createdAt)] }),
  ),

  adminById: adminProcedure.input(idInput).query(async ({ ctx, input }) => {
    const row = await ctx.db.query.Stamp.findFirst({
      where: eq(Stamp.id, input.id),
    });
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    return row;
  }),

  create: adminProcedure
    .input(CreateStampSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(Stamp).values(input).returning();
      if (!row) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (typeof row.priceCents === "number") {
        await ctx.db.insert(PriceHistory).values({
          entityType: "stamp",
          entityId: row.id,
          priceCents: row.priceCents,
        });
      }
      return row;
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), patch: UpdateStampSchema }))
    .mutation(async ({ ctx, input }) => {
      const before = await ctx.db.query.Stamp.findFirst({
        where: eq(Stamp.id, input.id),
      });
      if (!before) throw new TRPCError({ code: "NOT_FOUND" });

      const [row] = await ctx.db
        .update(Stamp)
        .set(input.patch)
        .where(eq(Stamp.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });

      if (
        typeof row.priceCents === "number" &&
        row.priceCents !== before.priceCents
      ) {
        await ctx.db.insert(PriceHistory).values({
          entityType: "stamp",
          entityId: row.id,
          priceCents: row.priceCents,
        });
      }
      return row;
    }),

  delete: adminProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(Stamp).where(eq(Stamp.id, input.id));
    return { ok: true };
  }),

  toggleHidden: adminProcedure
    .input(z.object({ id: z.string().uuid(), hidden: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(Stamp)
        .set({ hidden: input.hidden })
        .where(eq(Stamp.id, input.id));
      return { ok: true };
    }),
});
