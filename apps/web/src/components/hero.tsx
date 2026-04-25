"use client";

import Image from "next/image";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";

import { cn } from "@caixa/ui";

import { useTRPC } from "~/trpc/react";
import { LogoMark } from "./logo";
import { BigSparkle, GrainOverlay, Petal } from "./ornaments";

export function Hero() {
  const trpc = useTRPC();
  const { data: bundles } = useSuspenseQuery(
    trpc.bundle.catalogList.queryOptions(),
  );

  type FeaturedLike = {
    id: string;
    slug: string;
    title: string;
    media: { url: string; alt: string | null }[];
  };
  const enriched: FeaturedLike[] = bundles
    .filter((b): b is typeof b & { slug: string } => b.slug != null)
    .map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      media:
        b.media.length > 0
          ? b.media.map((m) => ({ url: m.url, alt: m.alt }))
          : (b.templateBox?.media ?? []),
    }))
    .filter((x) => x.media.length > 0);

  const featured = enriched[0];
  const heroImg = featured?.media[0];
  const side = enriched
    .filter((p) => p.id !== featured?.id && p.media.length > 0)
    .slice(0, 2);

  return (
    <section className="relative isolate -mt-[72px] min-h-[100svh] overflow-hidden pt-[72px] md:-mt-[80px] md:min-h-screen md:pt-[80px]">
      <BackgroundBlobs />
      <GrainOverlay />
      <DriftingPetals />

      <BigSparkle className="absolute left-[6%] top-[14%] size-4 text-primary md:size-6" delay="0s" />
      <BigSparkle className="absolute right-[10%] top-[18%] size-5 text-primary/80 md:size-7" delay="1.3s" />
      <BigSparkle className="absolute left-[16%] bottom-[18%] size-3 text-primary/70 md:size-5" delay="2.6s" />
      <BigSparkle className="absolute right-[26%] bottom-[12%] size-4 text-primary md:size-5" delay="3.9s" />

      <LogoMark className="pointer-events-none absolute right-[-4rem] top-[20%] size-[18rem] text-primary/[0.04] md:size-[28rem] md:right-[-8rem]" />

      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-7xl flex-col justify-center px-6 py-12 md:min-h-[calc(100vh-80px)] md:px-10 md:py-16">
        <div className="grid items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16 lg:gap-24">
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary shadow-sm shadow-primary/10 backdrop-blur-sm md:text-xs">
              <span aria-hidden>✦</span>
              Coleção Dia das Mães
              <span aria-hidden>✦</span>
            </span>

            <h1 className="mt-7 break-words font-serif font-medium leading-[0.95] tracking-tight text-foreground [font-size:clamp(2.75rem,8vw,6.25rem)]">
              Pequenos
              <br />
              <em className="text-shimmer font-serif italic">Encantos</em>,
              <br />
              Feitos à{" "}
              <em className="text-shimmer font-serif italic">Mão</em>.
            </h1>

            <p className="mx-auto mt-7 max-w-md text-balance text-base leading-relaxed text-muted-foreground md:mx-0 md:max-w-lg md:text-lg">
              Caixinhas artesanais feitas com cuidado — papel por papel,
              laço por laço. Escolha uma das opções prontas ou monte a sua
              personalizada: reserve pelo site e confirmamos cada detalhe
              pelo WhatsApp.
            </p>

            <dl className="mt-12 grid grid-cols-3 gap-4 text-left md:max-w-md">
              <HeroStat n="100%" t="Artesanal" />
              <HeroStat n="Sob" t="Encomenda" />
              <HeroStat n="Pix / Cartão" t="ou TED" />
            </dl>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md md:max-w-none">
            {heroImg && featured ? (
              <div className="group/featured relative px-2 py-6 md:px-10 md:py-10">
                <div
                  aria-hidden
                  className="animate-halo-pulse pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/30 via-accent/40 to-primary/15 blur-3xl"
                />

                <BigSparkle
                  className="animate-twinkle pointer-events-none absolute -left-3 -top-1 z-20 size-4 text-primary/80 md:-left-6 md:size-5"
                />
                <BigSparkle
                  className="animate-twinkle pointer-events-none absolute right-1 top-[42%] z-20 size-3 text-primary/70 md:right-3 md:size-4"
                  delay="2.2s"
                />
                <BigSparkle
                  className="animate-twinkle pointer-events-none absolute -bottom-2 left-[30%] z-20 size-3 text-primary/60 md:size-4"
                  delay="3.8s"
                />

                <article
                  className="relative -rotate-[1.4deg] transform-gpu overflow-hidden rounded-sm bg-gradient-to-br from-card via-accent/50 to-primary/10 p-3.5 ring-1 ring-border/60 shadow-2xl shadow-primary/25 transition duration-500 ease-out group-hover/featured:-rotate-[0.6deg] group-hover/featured:scale-[1.015] group-hover/featured:shadow-primary/40 md:p-5"
                  style={{ isolation: "isolate" }}
                >
                  <PaperGrain />

                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 z-30 w-1/3 -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-500 group-hover/featured:animate-shine-sweep group-hover/featured:opacity-100"
                  />

                  <Link
                    href={`/caixa/${featured.slug}`}
                    className="group relative block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden ring-1 ring-border/70">
                      <Image
                        src={heroImg.url}
                        alt={heroImg.alt ?? featured.title}
                        fill
                        priority
                        sizes="(min-width: 768px) 35vw, 75vw"
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
                      <div className="pointer-events-none absolute inset-0 inset-shadow-[0_0_28px_rgb(0_0_0/0.22)]" />
                    </div>

                    <div className="mt-3 flex items-baseline justify-between gap-3 px-0.5 md:mt-4">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.32em] text-primary/80 md:text-[10px]">
                          <span aria-hidden>✦</span>
                          Em Destaque
                        </p>
                        <p className="mt-0.5 truncate font-serif text-xl leading-tight text-foreground md:text-2xl">
                          {featured.title}
                        </p>
                      </div>
                      <p className="shrink-0 font-serif text-[10px] italic text-primary/70 md:text-xs">
                        N°. 01
                      </p>
                    </div>
                  </Link>
                </article>

                {side[0] && (
                  <PostageStamp
                    product={side[0]}
                    country="ENCANTIM · BRASIL"
                    value="01"
                    className="absolute -left-1 top-2 w-20 -rotate-[7deg] md:-left-14 md:-top-2 md:w-32"
                  />
                )}
                {side[1] && (
                  <PostageStamp
                    product={side[1]}
                    country="ATELIER · 2026"
                    value="02"
                    className="absolute -bottom-6 -right-2 hidden w-24 rotate-[6deg] md:block md:-bottom-10 md:-right-12 md:w-32"
                  />
                )}
              </div>
            ) : (
              <HeroPlaceholder />
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/60" />
      <div className="animate-float-slow absolute -left-32 -top-24 size-[32rem] rounded-full bg-primary/30 blur-3xl md:size-[44rem]" />
      <div className="animate-float-reverse absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-accent blur-3xl md:size-[40rem]" />
      <div className="animate-float-slow absolute left-1/3 top-1/2 size-64 rounded-full bg-primary/15 blur-3xl md:size-96" />
      {/* radial mask nos cantos */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-background)_95%)] opacity-70" />
    </div>
  );
}

function DriftingPetals() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <Petal
        variant="a"
        className="animate-drift-up absolute left-[12%] bottom-0 size-6 text-primary/30 md:size-8"
      />
      <Petal
        variant="b"
        className="animate-drift-up absolute left-[70%] bottom-0 size-8 text-primary/40 md:size-10"
        style={{ animationDelay: "6s" }}
      />
      <Petal
        variant="c"
        className="animate-drift-down absolute left-[40%] top-0 size-5 text-primary/30 md:size-7"
        style={{ animationDelay: "3s" }}
      />
      <Petal
        variant="a"
        className="animate-drift-up absolute left-[85%] bottom-0 size-6 text-primary/35 md:size-8"
        style={{ animationDelay: "10s" }}
      />
      <Petal
        variant="b"
        className="animate-drift-down absolute left-[25%] top-0 size-6 text-primary/25 md:size-7"
        style={{ animationDelay: "8s" }}
      />
    </div>
  );
}

function HeroStat({ n, t }: { n: string; t: string }) {
  return (
    <div className="border-l-2 border-primary/30 pl-3">
      <dt className="font-serif text-xl text-primary md:text-2xl">{n}</dt>
      <dd className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:text-xs">
        {t}
      </dd>
    </div>
  );
}

function PostageStamp({
  product,
  country,
  value,
  className,
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    media: { url: string; alt: string | null }[];
  };
  country: string;
  value: string;
  className?: string;
}) {
  const m = product.media[0]!;
  return (
    <Link
      href={`/caixa/${product.slug}`}
      aria-label={product.title}
      className={cn(
        "group relative block bg-secondary p-1.5 ring-1 ring-secondary-foreground/15 shadow-xl shadow-primary/25 outline outline-1 outline-dashed outline-offset-[3px] outline-primary/40 transition duration-300 ease-out hover:-translate-y-0.5 hover:rotate-0 hover:shadow-2xl hover:shadow-primary/40 md:p-2",
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={m.url}
          alt={m.alt ?? product.title}
          fill
          sizes="(min-width: 768px) 140px, 90px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <span className="absolute right-1 top-1 z-10 inline-flex items-center justify-center rounded-sm bg-primary px-1 text-[8px] font-bold tracking-wider text-primary-foreground shadow-sm md:px-1.5 md:text-[9px]">
          {value}
        </span>
      </div>
      <p className="mt-1 text-center font-serif text-[7px] uppercase tracking-[0.25em] text-secondary-foreground/70 md:text-[8px]">
        {country}
      </p>
    </Link>
  );
}

function PaperGrain() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full opacity-[0.18] mix-blend-multiply"
      aria-hidden
    >
      <filter id="paper-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.32  0 0 0 0 0.32  0 0 0 0.55 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
  );
}

function HeroPlaceholder() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-accent to-muted ring-1 ring-primary/20">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-serif text-xl text-primary/70">Suas caixinhas aqui</p>
      </div>
    </div>
  );
}

