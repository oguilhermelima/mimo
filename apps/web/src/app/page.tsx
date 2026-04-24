import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { Catalog } from "~/components/catalog";
import { EncomendaBanner } from "~/components/encomenda-banner";
import { Hero } from "~/components/hero";
import { CatalogGridSkeleton } from "~/components/skeletons";

export default function HomePage() {
  prefetch(trpc.bundle.catalogList.queryOptions());
  prefetch(trpc.product.catalog.queryOptions({ type: "box" }));

  return (
    <HydrateClient>
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>

      <section
        id="catalogo"
        className="mx-auto w-full max-w-7xl scroll-mt-24 px-6 py-20 md:px-10 md:py-28"
      >
        <div className="mb-10 flex flex-col items-center text-center md:mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">
            Confira nossos últimos lançamentos
          </span>
          <h2 className="mt-3 font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
            Nossas caixinhas
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Toque em qualquer uma para montar do seu jeito e encomendar
          </p>
        </div>
        <Suspense fallback={<CatalogGridSkeleton />}>
          <Catalog />
        </Suspense>
      </section>

      <EncomendaBanner />

      <div className="h-20 md:h-28" />
    </HydrateClient>
  );
}

function HeroFallback() {
  return (
    <div className="-mt-[72px] h-[100svh] animate-pulse bg-gradient-to-br from-primary/10 via-background to-accent md:-mt-[80px] md:h-screen" />
  );
}
