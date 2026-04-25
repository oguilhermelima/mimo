import { TRPCError } from "@trpc/server";
import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod/v4";

import {
  Address,
  CreateAddressSchema,
  UpdateAddressSchema,
  User,
} from "@caixa/db/schema";
import { updateProfileSchema } from "@caixa/validators";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const idInput = z.object({ id: z.string().uuid() });

/**
 * Endpoints do usuário autenticado. Tudo escopado em ctx.user.id —
 * nenhum endpoint público vaza dados de User.
 */
export const userRouter = createTRPCRouter({
  /** Whoami: campos seguros do próprio usuário. Nunca expor passwordHash, sessions, etc. */
  me: protectedProcedure.query(async ({ ctx }) => {
    const row = await ctx.db.query.User.findFirst({
      where: eq(User.id, ctx.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        cpf: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    if (!row) throw new TRPCError({ code: "NOT_FOUND" });
    return row;
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const current = await ctx.db.query.User.findFirst({
        where: eq(User.id, ctx.user.id),
        columns: { cpf: true },
      });
      if (!current) throw new TRPCError({ code: "NOT_FOUND" });

      const patch: Partial<typeof User.$inferInsert> = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.phone !== undefined)
        patch.phone = input.phone.length === 0 ? null : input.phone;
      if (input.image !== undefined) patch.image = input.image ?? null;

      if (input.cpf !== undefined && input.cpf.length > 0) {
        if (current.cpf && current.cpf !== input.cpf) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "CPF não pode ser alterado depois de cadastrado",
          });
        }
        if (!current.cpf) {
          const taken = await ctx.db.query.User.findFirst({
            where: and(eq(User.cpf, input.cpf), ne(User.id, ctx.user.id)),
            columns: { id: true },
          });
          if (taken) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "CPF já cadastrado em outra conta",
            });
          }
          patch.cpf = input.cpf;
        }
      }

      if (Object.keys(patch).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "nada pra atualizar" });
      }

      try {
        const [row] = await ctx.db
          .update(User)
          .set(patch)
          .where(eq(User.id, ctx.user.id))
          .returning({
            id: User.id,
            name: User.name,
            email: User.email,
            phone: User.phone,
            cpf: User.cpf,
            image: User.image,
          });
        if (!row) throw new TRPCError({ code: "NOT_FOUND" });
        return row;
      } catch (err) {
        if (
          err instanceof Error &&
          /unique|duplicate/i.test(err.message) &&
          patch.cpf
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "CPF já cadastrado em outra conta",
          });
        }
        throw err;
      }
    }),

  /* ── addresses ── */
  listAddresses: protectedProcedure.query(({ ctx }) =>
    ctx.db.query.Address.findMany({
      where: eq(Address.userId, ctx.user.id),
      orderBy: [asc(Address.createdAt)],
    }),
  ),

  addAddress: protectedProcedure
    .input(CreateAddressSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        if (input.isDefault) {
          await tx
            .update(Address)
            .set({ isDefault: false })
            .where(eq(Address.userId, ctx.user.id));
        }

        const existing = await tx.query.Address.findFirst({
          where: eq(Address.userId, ctx.user.id),
        });
        const isDefault = input.isDefault || !existing;

        const [row] = await tx
          .insert(Address)
          .values({ ...input, userId: ctx.user.id, isDefault })
          .returning();
        if (!row) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        return row;
      });
    }),

  updateAddress: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: UpdateAddressSchema }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Address.findFirst({
        where: and(
          eq(Address.id, input.id),
          eq(Address.userId, ctx.user.id),
        ),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.transaction(async (tx) => {
        if (input.patch.isDefault) {
          await tx
            .update(Address)
            .set({ isDefault: false })
            .where(
              and(
                eq(Address.userId, ctx.user.id),
                ne(Address.id, input.id),
              ),
            );
        }

        const [row] = await tx
          .update(Address)
          .set(input.patch)
          .where(eq(Address.id, input.id))
          .returning();
        if (!row) throw new TRPCError({ code: "NOT_FOUND" });
        return row;
      });
    }),

  deleteAddress: protectedProcedure
    .input(idInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Address.findFirst({
        where: and(
          eq(Address.id, input.id),
          eq(Address.userId, ctx.user.id),
        ),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.transaction(async (tx) => {
        await tx.delete(Address).where(eq(Address.id, input.id));

        if (existing.isDefault) {
          const next = await tx.query.Address.findFirst({
            where: eq(Address.userId, ctx.user.id),
            orderBy: [asc(Address.createdAt)],
          });
          if (next) {
            await tx
              .update(Address)
              .set({ isDefault: true })
              .where(eq(Address.id, next.id));
          }
        }
        return { ok: true };
      });
    }),

  setDefaultAddress: protectedProcedure
    .input(idInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.Address.findFirst({
        where: and(
          eq(Address.id, input.id),
          eq(Address.userId, ctx.user.id),
        ),
      });
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.db.transaction(async (tx) => {
        await tx
          .update(Address)
          .set({ isDefault: false })
          .where(eq(Address.userId, ctx.user.id));
        await tx
          .update(Address)
          .set({ isDefault: true })
          .where(eq(Address.id, input.id));
      });
      return { ok: true };
    }),
});
