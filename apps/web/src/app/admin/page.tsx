import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { AdminProductList } from "~/components/admin/product-list";
import { ListTableSkeleton } from "~/components/skeletons";

export const metadata = { title: "admin" };

export default function AdminHomePage() {
  prefetch(trpc.product.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<ListTableSkeleton />}>
          <AdminProductList />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
