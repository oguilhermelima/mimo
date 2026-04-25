import { bundleRouter } from "./router/bundle";
import { couponRouter } from "./router/coupon";
import { orderRouter } from "./router/order";
import { priceHistoryRouter } from "./router/price-history";
import { productRouter } from "./router/product";
import { stampRouter } from "./router/stamp";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  product: productRouter,
  stamp: stampRouter,
  bundle: bundleRouter,
  coupon: couponRouter,
  priceHistory: priceHistoryRouter,
  user: userRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;
