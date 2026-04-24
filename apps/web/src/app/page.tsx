import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { Catalog } from "~/components/catalog";
import { Hero } from "~/components/hero";

export default function HomePage() {
  prefetch(trpc.product.catalog.queryOptions());

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
          <h2 className="font-serif text-4xl text-foreground md:text-5xl lg:text-6xl">
            nossas caixinhas
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            toque em qualquer uma para montar do seu jeito e encomendar
          </p>
        </div>
        <Suspense
          fallback={<p className="text-center text-muted-foreground">carregando…</p>}
        >
          <Catalog />
        </Suspense>
      </section>
    </HydrateClient>
  );
}

function HeroFallback() {
  return (
    <div className="-mt-[72px] h-[100svh] animate-pulse bg-gradient-to-br from-primary/10 via-background to-accent md:-mt-[80px] md:h-screen" />
  );
}
