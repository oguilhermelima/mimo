import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProductEditor } from "~/components/admin/product-editor";
import { FormSkeleton } from "~/components/skeletons";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  prefetch(trpc.product.adminById.queryOptions({ id }));

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<FormSkeleton />}>
          <ProductEditor id={id} />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
