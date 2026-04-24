import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { CouponEditor } from "~/components/admin/coupon-editor";
import { FormSkeleton } from "~/components/skeletons";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.coupon.adminById.queryOptions({ id }));
  prefetch(trpc.product.adminAll.queryOptions());
  prefetch(trpc.bundle.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<FormSkeleton />}>
          <CouponEditor id={id} />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
