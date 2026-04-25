"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Ruler,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "@caixa/ui/toast";

import { Button } from "@caixa/ui/button";

import { useCart } from "~/lib/cart-store";
import { formatBRL, formatDimensions } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { BigSparkle, OrnamentalDivider } from "./ornaments";

export function BundleDetail({ slug }: { slug: string }) {
  const trpc = useTRPC();
  const { data: bundle } = useSuspenseQuery(
    trpc.bundle.bySlug.queryOptions({ slug }),
  );
  const add = useCart((s) => s.add);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

  const { data: latestHistory } = useQuery(
    trpc.priceHistory.latest.queryOptions({
      entityType: "bundle",
      entityId: bundle.id,
    }),
  );

  const gallery =
    bundle.media.length > 0 ? bundle.media : (bundle.templateBox?.media ?? []);
  const price = bundle.effectivePriceCents;
  const dims = formatDimensions(
    bundle.templateBox?.widthMm,
    bundle.templateBox?.heightMm,
    bundle.templateBox?.depthMm,
  );
  const previousPriceCents =
    latestHistory &&
    typeof price === "number" &&
    latestHistory.priceCents > price
      ? latestHistory.priceCents
      : null;

  const isSoldOut = bundle.quantity <= 0;
  const isLowStock =
    !isSoldOut && bundle.quantity <= bundle.lowStockThreshold;

  const handleGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentMediaIdx(idx);
  };

  const goToMedia = (i: number) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const handleAdd = () => {
    if (isSoldOut) return;
    add({
      kind: "bundle",
      itemId: bundle.id,
      title: bundle.title,
      priceCents: price,
      imageUrl:
        bundle.stamp?.imageUrl ?? bundle.templateBox?.media[0]?.url ?? null,
    });
    toast.success(`${bundle.title} adicionada ao carrinho`);
  };

  return (
    <div className="relative isolate space-y-8 md:space-y-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <BigSparkle
          className="absolute right-[6%] top-[8%] size-5 text-primary/40 md:size-6"
          delay="0s"
        />
        <BigSparkle
          className="absolute left-[2%] top-[40%] size-3 text-primary/30 md:size-4"
          delay="2.4s"
        />
        <BigSparkle
          className="absolute right-[24%] bottom-[18%] size-4 text-primary/35 md:size-5"
          delay="4.1s"
        />
        <div className="absolute -right-32 top-1/3 size-72 rounded-full bg-primary/10 blur-3xl md:size-96" />
        <div className="absolute -left-24 bottom-0 size-64 rounded-full bg-accent/30 blur-3xl md:size-80" />
      </div>

      <div className="flex items-center text-xs uppercase tracking-[0.24em] text-muted-foreground">
        <Link
          href="/produtos"
          className="group inline-flex items-center gap-2 transition hover:text-primary"
        >
          <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
          Voltar aos Presentes
        </Link>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="min-w-0 space-y-3">
          <div className="group/gallery relative">
            <div
              ref={galleryRef}
              onScroll={handleGalleryScroll}
              className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
            >
              {gallery.length === 0 ? (
                <div className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden rounded-3xl bg-muted/50 ring-1 ring-border/40">
                  <div className="flex h-full items-center justify-center font-serif text-muted-foreground">
                    Sem mídia
                  </div>
                </div>
              ) : (
                gallery.map((m) => (
                  <div
                    key={m.id}
                    className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden rounded-3xl bg-muted/50 ring-1 ring-border/40"
                  >
                    {m.kind === "video" ? (
                      <video src={m.url} controls className="h-full w-full object-cover" />
                    ) : (
                      <Image
                        src={m.url}
                        alt={m.alt ?? bundle.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToMedia(Math.max(0, currentMediaIdx - 1))}
                  disabled={currentMediaIdx === 0}
                  aria-label="foto anterior"
                  className="absolute left-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg ring-1 ring-border/60 backdrop-blur transition hover:bg-background hover:text-primary disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-0 md:group-hover/gallery:opacity-100"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    goToMedia(Math.min(gallery.length - 1, currentMediaIdx + 1))
                  }
                  disabled={currentMediaIdx === gallery.length - 1}
                  aria-label="próxima foto"
                  className="absolute right-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-lg ring-1 ring-border/60 backdrop-blur transition hover:bg-background hover:text-primary disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-0 md:group-hover/gallery:opacity-100"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {gallery.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => goToMedia(i)}
                  aria-label={`ir para foto ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentMediaIdx
                      ? "w-5 bg-primary"
                      : "w-1.5 bg-border hover:bg-primary/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-primary/80 md:text-xs">
              <span aria-hidden>✦</span>
              Caixa Pronta
            </p>
            <h1 className="mt-3 break-words font-serif text-4xl leading-[1.05] text-foreground md:text-6xl">
              {bundle.title}
            </h1>
            <OrnamentalDivider className="mt-5 h-3 w-32 text-primary/55" />
            <div className="mt-5 flex items-baseline gap-3">
              <p className="font-serif text-4xl text-primary md:text-5xl">
                {formatBRL(price)}
              </p>
              {previousPriceCents != null && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatBRL(previousPriceCents)}
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {isSoldOut ? (
                <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                  esgotado
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                  últimas {bundle.quantity} unidades
                </span>
              ) : null}
              {previousPriceCents != null && (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-wide text-emerald-700">
                  promoção
                </span>
              )}
            </div>
          </div>

          {bundle.description && (
            <p className="text-base leading-relaxed text-foreground/85 md:text-lg">
              {bundle.description}
            </p>
          )}

          <dl className="grid grid-cols-3 gap-3 border-y border-primary/15 py-4 text-center">
            <div>
              <dt className="font-serif text-base text-primary md:text-lg">
                100%
              </dt>
              <dd className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground md:text-[10px]">
                Artesanal
              </dd>
            </div>
            <div className="border-x border-primary/15">
              <dt className="font-serif text-base text-primary md:text-lg">
                Pronta
              </dt>
              <dd className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground md:text-[10px]">
                Entrega
              </dd>
            </div>
            <div>
              <dt className="font-serif text-base text-primary md:text-lg">
                Pix · Cartão
              </dt>
              <dd className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground md:text-[10px]">
                ou TED
              </dd>
            </div>
          </dl>

          {dims && (
            <div className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 p-5 ring-1 ring-border/40">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:text-xs">
                <Ruler className="size-3.5" />
                Dimensões
              </div>
              <p className="mt-2 font-serif text-xl text-foreground md:text-2xl">
                {dims}
              </p>
            </div>
          )}

          {bundle.stamp && (
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 p-5 ring-1 ring-border/40">
              {bundle.stamp.imageUrl && (
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-xl bg-background">
                  <Image
                    src={bundle.stamp.imageUrl}
                    alt={bundle.stamp.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:text-xs">
                  Estampa
                </div>
                <p className="font-serif text-lg text-foreground md:text-xl">
                  {bundle.stamp.name}
                </p>
              </div>
            </div>
          )}

          {bundle.items.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 via-primary/5 to-accent/15 p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-serif text-xl text-primary md:text-2xl">
                  <Sparkles className="size-4" />
                  Inclui
                </h3>
                <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  {bundle.items.length} {bundle.items.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <div className="scrollbar-hide -mx-5 mt-4 overflow-x-auto px-5">
                <ul className="flex snap-x gap-3 pb-1">
                  {bundle.items.map((it) => {
                    const media = it.product.media[0];
                    return (
                      <li
                        key={it.id}
                        className="w-32 shrink-0 snap-start sm:w-36"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-inset ring-border/40">
                          {media ? (
                            <Image
                              src={media.url}
                              alt={media.alt ?? it.product.title}
                              fill
                              sizes="(min-width: 640px) 144px, 128px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-3xl font-serif text-primary/30">
                              ✦
                            </div>
                          )}
                          {it.quantity > 1 && (
                            <span className="absolute right-1.5 top-1.5 rounded-full bg-background/95 px-1.5 py-0.5 text-[10px] font-semibold text-primary shadow-sm">
                              {it.quantity}×
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-snug text-foreground">
                          {it.product.title}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <Button
            onClick={handleAdd}
            disabled={isSoldOut}
            className="group/cta relative mt-2 h-16 w-full gap-3 overflow-hidden text-base font-semibold tracking-wide shadow-xl shadow-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/40 disabled:opacity-60 md:h-[72px] md:text-lg"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity group-hover/cta:animate-shine-sweep"
            />
            <ShoppingBag className="size-5 md:size-[22px]" />
            {isSoldOut ? "Esgotado" : "Adicionar ao carrinho"}
            {!isSoldOut && (
              <span aria-hidden className="ml-1 font-serif text-base opacity-80 md:text-lg">
                ✦
              </span>
            )}
          </Button>
        </div>
      </div>

      <Link
        href="/sobre"
        className="group relative mt-10 block overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-background to-accent/25 p-7 transition hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 sm:p-8 md:mt-16 md:p-10"
      >
        <BigSparkle
          className="absolute right-[6%] top-[10%] size-5 text-primary/45 md:size-6"
          delay="0s"
        />
        <BigSparkle
          className="absolute left-[8%] bottom-[14%] size-4 text-primary/40 md:size-5"
          delay="2.4s"
        />
        <BigSparkle
          className="absolute right-[18%] bottom-[22%] size-3 text-primary/35 md:hidden"
          delay="4s"
        />

        <div className="relative grid items-center gap-7 md:grid-cols-[1fr_auto] md:gap-12">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-primary/80 md:text-xs">
              <span aria-hidden>✦</span>
              Sobre o Atelier
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-[1.1] text-foreground md:text-4xl">
              Cada caixinha nasce com zelo
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:mt-5 md:leading-loose">
              Papéis escolhidos um a um, fitas finas, atenção em cada detalhe.
              No{" "}
              <em className="font-serif not-italic text-primary">Encantim</em>,
              cada caixinha recebe o mesmo cuidado — porque presentear é gesto
              que atravessa anos.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-base font-medium text-primary transition group-hover:gap-3 md:text-sm">
              Conhecer o Atelier
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </div>

          <div className="relative hidden h-44 w-32 shrink-0 md:block md:h-56 md:w-40">
            <div className="absolute -left-2 top-3 size-full -rotate-3 transform-gpu rounded-sm bg-[#fce4e0] p-1.5 ring-1 ring-black/10 shadow-lg">
              <div className="relative size-full overflow-hidden">
                <Image
                  src="/catalogo/melodia-rosas-1.jpeg"
                  alt="Caixa Melodia de Rosas aberta"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -right-1 -top-1 size-full rotate-2 transform-gpu rounded-sm bg-[#f3e7c8] p-1.5 ring-1 ring-black/15 shadow-xl">
              <div className="relative size-full overflow-hidden">
                <Image
                  src="/catalogo/sabedoria-1.jpeg"
                  alt="Caixa Sabedoria aberta"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
