import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod/v4";

import { db } from "@caixa/db/client";
import type { UserRole } from "@caixa/db/schema";

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface AuthSession {
  user: AuthSessionUser;
  session: { id: string; expiresAt: Date };
}

export const createTRPCContext = async (opts: {
  headers: Headers;
  session: AuthSession | null;
}) => {
  return {
    db,
    headers: opts.headers,
    session: opts.session,
    user: opts.session?.user ?? null,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  console.log(`[TRPC] ${path} took ${Date.now() - start}ms`);
  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Faça login pra continuar",
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user, session: ctx.session! } });
  });

export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Login obrigatório" });
    }
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito" });
    }
    return next({ ctx: { ...ctx, user: ctx.user, session: ctx.session! } });
  });
