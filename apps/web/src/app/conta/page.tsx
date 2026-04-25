import { Suspense } from "react";

import { AccountView } from "~/components/account-view";
import { ListTableSkeleton } from "~/components/skeletons";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export const metadata = { title: "conta" };

export default function ContaPage() {
  prefetch(trpc.user.me.queryOptions());
  prefetch(trpc.user.listAddresses.queryOptions());
  prefetch(trpc.order.myOrders.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-12">
        <Suspense fallback={<ListTableSkeleton />}>
          <AccountView />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
