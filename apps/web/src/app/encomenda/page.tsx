import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { CustomOrderFlow } from "~/components/custom-order-flow";
import { EncomendaSkeleton } from "~/components/skeletons";

export default function EncomendaPage() {
  prefetch(trpc.product.publicTemplateBoxes.queryOptions());
  prefetch(trpc.stamp.listAvailable.queryOptions());
  prefetch(trpc.product.publicContents.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<EncomendaSkeleton />}>
          <CustomOrderFlow />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
