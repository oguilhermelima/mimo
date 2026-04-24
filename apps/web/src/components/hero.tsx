"use client";

import Image from "next/image";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, MessageCircleHeart } from "lucide-react";

import { Button } from "@caixa/ui/button";

import { env } from "~/env";
import { useTRPC } from "~/trpc/react";
import { LogoMark } from "./logo";
import {
  BigSparkle,
  CornerFlourish,
  GlitterOverlay,
  GrainOverlay,
  Petal,
} from "./ornaments";

export function Hero() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.product.catalog.queryOptions());
  const featured = data.find((p) => p.media.length > 0);
  const heroImg = featured?.media[0];
  const side = data
    .filter((p) => p.id !== featured?.id && p.media.length > 0)
    .slice(0, 3);

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
              coleção dia das mães
              <span aria-hidden>✦</span>
            </span>

            <h1 className="mt-7 font-serif font-medium leading-[0.92] tracking-tight text-foreground [font-size:clamp(3.25rem,9vw,7.5rem)]">
              presentes
              <br />
              feitos{" "}
              <em className="text-shimmer font-serif italic">à&nbsp;mão</em>,
              <br />
              com{" "}
              <em className="text-shimmer font-serif italic">carinho</em>.
            </h1>

            <p className="mx-auto mt-7 max-w-md text-balance text-base leading-relaxed text-muted-foreground md:mx-0 md:max-w-lg md:text-lg">
              Caixas artesanais que guardam memórias. Monte a sua com os
              itens que quiser — a gente finaliza tudo com carinho pelo
              WhatsApp.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Button
                asChild
                size="lg"
                className="group gap-2 rounded-full px-7 shadow-lg shadow-primary/25"
              >
                <Link href="#catalogo">
                  Ver o Catálogo
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
              <HeroStat n="100%" t="artesanal" />
              <HeroStat n="sob" t="encomenda" />
              <HeroStat n="pix / cartão" t="ou ted" />
            </dl>
          </div>

          <div className="relative z-10 mx-auto w-full max-w-md md:max-w-none">
            {heroImg && featured ? (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[18rem] sm:max-w-[22rem] md:ml-auto md:max-w-[28rem] lg:max-w-none">
                {/* halo pulsante atrás */}
                <div className="animate-halo-pulse absolute -inset-10 rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-transparent blur-3xl" />
                {/* sombra colorida extra */}
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-accent/30 to-primary/20 blur-2xl" />

                <Link
                  href={`/produto/${featured.slug}`}
                  className="group relative block aspect-[4/5] w-full"
                >
                  {/* cantos ornamentados */}
                  <CornerFlourish className="pointer-events-none absolute -left-4 -top-4 z-20 size-12 md:size-16" />
                  <CornerFlourish className="pointer-events-none absolute -right-4 -top-4 z-20 size-12 -scale-x-100 md:size-16" />
                  <CornerFlourish className="pointer-events-none absolute -bottom-4 -left-4 z-20 size-12 -scale-y-100 md:size-16" />
                  <CornerFlourish className="pointer-events-none absolute -bottom-4 -right-4 z-20 size-12 -scale-100 md:size-16" />

                  <div
                    className="animate-float-tilt relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/30 ring-1 ring-primary/20 transition-[box-shadow] duration-500 group-hover:shadow-primary/40"
                    style={{
                      isolation: "isolate",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <Image
                      src={heroImg.url}
                      alt={heroImg.alt ?? featured.title}
                      fill
                      priority
                      sizes="(min-width: 768px) 45vw, 90vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                    />
                    {/* vinheta radial */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.35)_100%)]" />
                    {/* overlay gradient bottom */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                    {/* glitter mágico */}
                    <GlitterOverlay />

                    <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-10 text-primary-foreground">
                      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] opacity-90">
                        <span className="inline-block h-px w-6 bg-primary-foreground/70" />
                        em destaque
                      </p>
                      <p className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
                        {featured.title}
                      </p>
                    </div>

                    <span className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-primary shadow-md backdrop-blur">
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                      Clique para Ver
                    </span>
                  </div>
                </Link>

                {side[0] && (
                  <FloatingThumb
                    product={side[0]}
                    className="absolute -left-6 -top-6 hidden h-32 w-[6.4rem] sm:block md:-left-12 md:-top-12 md:h-40 md:w-32"
                    style={{ animationDelay: "0.5s" }}
                    label="02"
                  />
                )}
                {side[1] && (
                  <FloatingThumb
                    product={side[1]}
                    className="absolute -right-6 top-1/3 hidden h-28 w-[5.6rem] sm:block md:-right-10 md:h-32 md:w-[6.4rem]"
                    style={{ animationDelay: "1.8s" }}
                    label="03"
                  />
                )}
                {side[2] && (
                  <FloatingThumb
                    product={side[2]}
                    className="absolute -bottom-6 left-6 hidden h-28 w-[5.6rem] sm:block md:-bottom-10 md:left-8 md:h-32 md:w-[6.4rem]"
                    style={{ animationDelay: "3.2s" }}
                    label="04"
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

function FloatingThumb({
  product,
  className,
  style,
  label,
}: {
  product: {
    id: string;
    slug: string;
    title: string;
    media: { url: string; alt: string | null }[];
  };
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  const m = product.media[0]!;
  return (
    <Link
      href={`/produto/${product.slug}`}
      aria-label={product.title}
      className={`animate-float-tilt group absolute overflow-hidden rounded-2xl shadow-xl ring-2 ring-background transition-[box-shadow,ring] duration-300 hover:ring-primary ${className ?? ""}`}
      style={{
        isolation: "isolate",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        ...style,
      }}
    >
      <div className="relative size-full">
        <Image
          src={m.url}
          alt={m.alt ?? product.title}
          fill
          sizes="140px"
          className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.08]"
        />
        <GlitterOverlay />
        {label && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-background/90 px-1.5 py-0.5 text-[9px] font-semibold text-primary shadow-sm">
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}

function HeroPlaceholder() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/20 via-accent to-muted ring-1 ring-primary/20">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="font-serif text-xl text-primary/70">suas caixinhas aqui</p>
      </div>
    </div>
  );
}

