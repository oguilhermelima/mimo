import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { BundleDetail } from "~/components/bundle-detail";
import { DetailPageSkeleton } from "~/components/skeletons";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BundlePage({ params }: Props) {
  const { slug } = await params;
  prefetch(trpc.bundle.bySlug.queryOptions({ slug }));

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 pb-12 pt-1 md:px-10 md:pb-16 md:pt-6">
        <Suspense fallback={<DetailPageSkeleton />}>
          <BundleDetail slug={slug} />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
