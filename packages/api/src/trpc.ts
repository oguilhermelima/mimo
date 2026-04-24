import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod/v4";

import { db } from "@caixa/db/client";

/**
 * Admin gate is cookie-based: Next middleware sets `admin-session` after a
 * successful password post at `/api/admin/login`. tRPC context just reflects
 * whether the cookie is present.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const isAdmin = opts.headers
    .get("cookie")
    ?.split(";")
    .some((c) => c.trim().startsWith("admin-session="));

  return { db, isAdmin: Boolean(isAdmin) };
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

export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.isAdmin) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin only" });
    }
    return next({ ctx });
  });
