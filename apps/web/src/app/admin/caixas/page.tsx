import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { BundleList } from "~/components/admin/bundle-list";
import { ListTableSkeleton } from "~/components/skeletons";

export default function BundlesPage() {
  prefetch(trpc.bundle.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<ListTableSkeleton />}>
          <BundleList />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
