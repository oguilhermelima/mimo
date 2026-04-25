"use client";

import Image from "next/image";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, MessageCircleHeart } from "lucide-react";

import { Button } from "@caixa/ui/button";
import { cn } from "@caixa/ui";

import { env } from "~/env";
import { useTRPC } from "~/trpc/react";
import { LogoMark } from "./logo";
import {
  BigSparkle,
  GrainOverlay,
  Petal,
  WashiTape,
  WaxSeal,
} from "./ornaments";

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

  const waHref = `https://wa.me/${env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá! Quero saber mais sobre as caixinhas da ${env.NEXT_PUBLIC_STORE_NAME} 💌`)}`;

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

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Button
                asChild
                size="lg"
                className="group gap-2 rounded-full px-7 shadow-lg shadow-primary/25"
              >
                <Link href="#catalogo">
                  Ver os Presentes
                  <ArrowDown className="size-4 transition group-hover:translate-y-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 rounded-full border-primary/30 bg-background/60 backdrop-blur-sm"
              >
                <a href={waHref} target="_blank" rel="noreferrer">
                  <MessageCircleHeart className="size-4" />
                  Falar no WhatsApp
                </a>
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-4 text-left md:max-w-md">
              <HeroStat n="100%" t="Artesanal" />
              <HeroStat n="Sob" t="Encomenda" />
              <HeroStat n="Pix / Cartão" t="ou TED" />
            </dl>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md md:max-w-none">
            {heroImg && featured ? (
              <div className="relative px-2 py-6 md:px-10 md:py-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/30 blur-3xl"
                />

                <article
                  className="relative -rotate-[1.4deg] transform-gpu rounded-[3px] bg-[#fce4e0] p-3.5 ring-1 ring-black/10 shadow-[0_30px_55px_-22px_rgba(0,0,0,0.55),0_15px_25px_-15px_rgba(0,0,0,0.35)] md:p-5"
                  style={{ isolation: "isolate" }}
                >
                  <PaperGrain />
                  <DeckledStrip className="absolute -top-1 inset-x-3 h-1.5" />
                  <DeckledStrip className="absolute -bottom-1 inset-x-3 h-1.5 -scale-y-100" />

                  <Link
                    href={`/caixa/${featured.slug}`}
                    className="group relative block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden ring-1 ring-black/15">
                      <Image
                        src={heroImg.url}
                        alt={heroImg.alt ?? featured.title}
                        fill
                        priority
                        sizes="(min-width: 768px) 35vw, 75vw"
                        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_28px_rgba(0,0,0,0.22)]" />
                    </div>

                    <div className="mt-3 flex items-baseline justify-between gap-3 px-0.5 md:mt-4">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#a86b6b] md:text-[10px]">
                          Em Destaque
                        </p>
                        <p className="mt-0.5 truncate font-serif text-xl leading-tight text-[#5a2a2a] md:text-2xl">
                          {featured.title}
                        </p>
                      </div>
                      <p className="shrink-0 font-serif text-[10px] italic text-[#a86b6b]/85 md:text-xs">
                        N°. 01
                      </p>
                    </div>
                  </Link>

                  <WaxSeal className="pointer-events-none absolute -bottom-5 -right-3 size-14 rotate-[10deg] md:-bottom-8 md:-right-6 md:size-20" />
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
                  <div className="absolute -bottom-6 -right-2 hidden w-24 rotate-[6deg] md:block md:-bottom-10 md:-right-12 md:w-32">
                    <WashiTape className="absolute -top-3 left-1/2 z-20 h-3 w-20 -translate-x-1/2 -rotate-[14deg] text-primary/70 drop-shadow-md md:-top-4 md:h-4 md:w-24" />
                    <PostageStamp
                      product={side[1]}
                      country="ATELIER · 2026"
                      value="02"
                    />
                  </div>
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
        "group relative block bg-[#fdfaee] p-1.5 ring-1 ring-black/15 shadow-[0_14px_24px_-10px_rgba(0,0,0,0.55),0_6px_10px_-6px_rgba(0,0,0,0.4)] outline outline-1 outline-dashed outline-offset-[3px] outline-black/30 md:p-2",
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
        <span className="absolute right-1 top-1 z-10 inline-flex items-center justify-center rounded-sm bg-[#fdfaee]/95 px-1 text-[8px] font-bold tracking-wider text-[#3a2812] shadow-sm md:px-1.5 md:text-[9px]">
          {value}
        </span>
      </div>
      <p className="mt-1 text-center font-serif text-[7px] uppercase tracking-[0.25em] text-[#3a2812]/80 md:text-[8px]">
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

function DeckledStrip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 6"
      preserveAspectRatio="none"
      className={cn("pointer-events-none text-[#fce4e0]", className)}
      aria-hidden
    >
      <path
        d="M0 6 L0 4 Q 6 2 12 3 T 24 3 T 36 2 T 48 4 T 60 2 T 72 3 T 84 2 T 96 4 T 108 2 T 120 3 T 132 2 T 144 4 T 156 2 T 168 3 T 180 2 T 200 3 L 200 6 Z"
        fill="currentColor"
      />
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

