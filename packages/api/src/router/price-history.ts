import { and, desc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import { PRICE_HISTORY_ENTITIES, PriceHistory } from "@caixa/db/schema";

import { createTRPCRouter, publicProcedure } from "../trpc";

const scopeInput = z.object({
  entityType: z.enum(PRICE_HISTORY_ENTITIES),
  entityId: z.string().uuid(),
});

export const priceHistoryRouter = createTRPCRouter({
  /** Todas as entradas de histórico de uma entidade, mais recentes primeiro. */
  list: publicProcedure.input(scopeInput).query(({ ctx, input }) =>
    ctx.db.query.PriceHistory.findMany({
      where: and(
        eq(PriceHistory.entityType, input.entityType),
        eq(PriceHistory.entityId, input.entityId),
      ),
      orderBy: [desc(PriceHistory.changedAt)],
    }),
  ),

  /** Entrada mais recente (ou null). Client compara com preço atual pra badge de promoção. */
  latest: publicProcedure.input(scopeInput).query(async ({ ctx, input }) => {
    const row = await ctx.db.query.PriceHistory.findFirst({
      where: and(
        eq(PriceHistory.entityType, input.entityType),
        eq(PriceHistory.entityId, input.entityId),
      ),
      orderBy: [desc(PriceHistory.changedAt)],
    });
    return row ?? null;
  }),
});
