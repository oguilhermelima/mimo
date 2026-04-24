import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { CouponList } from "~/components/admin/coupon-list";
import { ListTableSkeleton } from "~/components/skeletons";

export default function CouponsPage() {
  prefetch(trpc.coupon.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<ListTableSkeleton />}>
          <CouponList />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
