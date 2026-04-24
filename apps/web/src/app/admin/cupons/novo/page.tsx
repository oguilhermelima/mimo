import { Suspense } from "react";

import { AdminNav } from "~/components/admin/admin-nav";
import { CouponForm } from "~/components/admin/coupon-form";
import { FormSkeleton } from "~/components/skeletons";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default function NewCouponPage() {
  prefetch(trpc.product.adminAll.queryOptions());
  prefetch(trpc.bundle.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 md:px-10 md:py-16">
        <header className="space-y-4">
          <h1 className="font-serif text-3xl text-primary">Novo cupom</h1>
          <AdminNav />
        </header>
        <Suspense fallback={<FormSkeleton />}>
          <CouponForm />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
