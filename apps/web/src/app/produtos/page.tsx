import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { ProductsPage } from "~/components/products-page";
import { ProductsPageSkeleton } from "~/components/skeletons";

export const metadata = { title: "produtos" };

export default function ProdutosRoute() {
  prefetch(trpc.bundle.catalogList.queryOptions());
  prefetch(trpc.product.catalog.queryOptions());

  return (
    <HydrateClient>
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <Suspense fallback={<ProductsPageSkeleton />}>
          <ProductsPage />
        </Suspense>
      </section>
    </HydrateClient>
  );
}
