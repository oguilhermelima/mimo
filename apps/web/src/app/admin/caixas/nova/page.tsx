import { Suspense } from "react";

import { AdminNav } from "~/components/admin/admin-nav";
import { BundleForm } from "~/components/admin/bundle-form";
import { FormSkeleton } from "~/components/skeletons";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default function NewBundlePage() {
  prefetch(trpc.product.adminAll.queryOptions({ type: "template_box" }));
  prefetch(trpc.stamp.adminAll.queryOptions());
  prefetch(trpc.product.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-12 md:px-10 md:py-16">
        <header className="space-y-4">
          <h1 className="font-serif text-3xl text-primary">Nova caixa</h1>
          <AdminNav />
        </header>
        <Suspense fallback={<FormSkeleton />}>
          <BundleForm />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
