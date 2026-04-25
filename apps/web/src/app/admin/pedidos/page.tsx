import { Suspense } from "react";

import { AdminNav } from "~/components/admin/admin-nav";
import { AdminOrderList } from "~/components/admin/order-list";
import { ListTableSkeleton } from "~/components/skeletons";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export const metadata = { title: "admin · pedidos" };

export default function AdminOrdersPage() {
  prefetch(trpc.order.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-3xl text-primary md:text-4xl">
            Pedidos
          </h1>
          <AdminNav />
        </header>

        <Suspense fallback={<ListTableSkeleton />}>
          <AdminOrderList />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
