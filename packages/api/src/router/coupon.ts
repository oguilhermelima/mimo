import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import {
  Coupon,
  CreateCouponSchema,
  UpdateCouponSchema,
} from "@caixa/db/schema";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

const idInput = z.object({ id: z.string().uuid() });

function isActive(c: typeof Coupon.$inferSelect): {
  ok: boolean;
  reason?: string;
} {
  if (!c.active) return { ok: false, reason: "cupom inativo" };
  const now = new Date();
  if (c.validFrom && c.validFrom > now)
    return { ok: false, reason: "cupom ainda não válido" };
  if (c.validTo && c.validTo < now)
    return { ok: false, reason: "cupom expirado" };
  if (typeof c.maxUses === "number" && c.usedCount >= c.maxUses)
    return { ok: false, reason: "cupom esgotado" };
  return { ok: true };
}

export const couponRouter = createTRPCRouter({
  /** Public: busca cupom por código. Retorna null se inválido. */
  byCode: publicProcedure
    .input(z.object({ code: z.string().min(1).max(64) }))
    .query(async ({ ctx, input }) => {
      const coupon = await ctx.db.query.Coupon.findFirst({
        where: eq(Coupon.code, input.code.toUpperCase()),
      });
      if (!coupon) return null;
      const check = isActive(coupon);
      if (!check.ok) return { ...coupon, _invalid: check.reason };
      return coupon;
    }),

  /* ── admin ── */
  adminAll: adminProcedure.query(({ ctx }) =>
    ctx.db.query.Coupon.findMany({ orderBy: [desc(Coupon.createdAt)] }),
  ),

  adminById: adminProcedure.input(idInput).query(async ({ ctx, input }) => {
    const row = await ctx.db.query.Coupon.findFirst({
      where: eq(Coupon.id, input.id),
    });
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    return row;
  }),

  create: adminProcedure
    .input(CreateCouponSchema)
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .insert(Coupon)
        .values({ ...input, code: input.code.toUpperCase() })
        .returning();
      if (!row) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return row;
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), patch: UpdateCouponSchema }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(Coupon)
        .set(input.patch)
        .where(eq(Coupon.id, input.id))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      return row;
    }),

  delete: adminProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(Coupon).where(eq(Coupon.id, input.id));
    return { ok: true };
  }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string().uuid(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(Coupon)
        .set({ active: input.active })
        .where(eq(Coupon.id, input.id));
      return { ok: true };
    }),
});
