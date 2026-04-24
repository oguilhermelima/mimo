import { bundleRouter } from "./router/bundle";
import { couponRouter } from "./router/coupon";
import { priceHistoryRouter } from "./router/price-history";
import { productRouter } from "./router/product";
import { stampRouter } from "./router/stamp";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  product: productRouter,
  stamp: stampRouter,
  bundle: bundleRouter,
  coupon: couponRouter,
  priceHistory: priceHistoryRouter,
});

export type AppRouter = typeof appRouter;
