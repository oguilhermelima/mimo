import { productRouter } from "./router/product";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  product: productRouter,
});

export type AppRouter = typeof appRouter;
