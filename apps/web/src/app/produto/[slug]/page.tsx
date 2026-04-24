import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProductDetail } from "~/components/product-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  prefetch(trpc.product.bySlug.queryOptions({ slug }));

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 pb-12 pt-4 md:px-10 md:pb-16 md:pt-6">
        <Suspense
          fallback={<p className="text-muted-foreground">carregando…</p>}
        >
          <ProductDetail slug={slug} />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
