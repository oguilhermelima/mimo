import { Suspense } from "react";

import { CheckoutFlow } from "~/components/checkout-flow";
import { ListTableSkeleton } from "~/components/skeletons";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export const metadata = { title: "checkout" };

export default function CheckoutPage() {
  prefetch(trpc.user.me.queryOptions());
  prefetch(trpc.user.listAddresses.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-5xl px-6 py-10 md:px-10 md:py-16">
        <Suspense fallback={<ListTableSkeleton />}>
          <CheckoutFlow />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
