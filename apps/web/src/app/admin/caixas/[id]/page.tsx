import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { BundleEditor } from "~/components/admin/bundle-editor";
import { FormSkeleton } from "~/components/skeletons";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBundlePage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.bundle.adminById.queryOptions({ id }));
  prefetch(trpc.product.adminAll.queryOptions({ type: "template_box" }));
  prefetch(trpc.stamp.adminAll.queryOptions());
  prefetch(trpc.product.adminAll.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<FormSkeleton />}>
          <BundleEditor id={id} />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
