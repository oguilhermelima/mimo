"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
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
import { LogoMonogram } from "./logo";

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
    <div className="space-y-8">
      <div className="hidden items-center justify-end gap-4 sm:flex">
        <LogoMonogram className="h-7 w-auto text-primary/60 md:h-8" />
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

        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <h1 className="break-words font-serif text-4xl leading-tight text-primary md:text-5xl">
              {bundle.title}
            </h1>
            <div className="mt-3 flex items-baseline gap-3">
              <p className="font-serif text-3xl text-foreground">
                {formatBRL(price)}
              </p>
              {previousPriceCents != null && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatBRL(previousPriceCents)}
                </p>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {isSoldOut ? (
                <span className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                  esgotado
                </span>
              ) : isLowStock ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
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
            <p className="text-muted-foreground">{bundle.description}</p>
          )}

          {dims && (
            <div className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border/40">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                <Ruler className="size-3.5" />
                Dimensões
              </div>
              <p className="mt-2 font-serif text-lg text-foreground">{dims}</p>
            </div>
          )}

          {bundle.stamp && (
            <div className="flex items-center gap-3 rounded-2xl bg-muted/40 p-4 ring-1 ring-border/40">
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
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Estampa
                </div>
                <p className="font-serif text-lg text-foreground">
                  {bundle.stamp.name}
                </p>
              </div>
            </div>
          )}

          {bundle.items.length > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h3 className="flex items-center gap-2 font-serif text-xl text-primary">
                <Sparkles className="size-4" />
                Inclui
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-foreground">
                {bundle.items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      {it.quantity > 1 ? `${it.quantity}× ` : ""}
                      {it.product.title}
                    </span>
                    {it.product.priceCents != null && (
                      <span className="text-xs text-muted-foreground">
                        {formatBRL(it.product.priceCents)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={handleAdd}
            size="lg"
            className="mt-2 gap-2"
            disabled={isSoldOut}
          >
            <ShoppingBag className="size-4" />
            {isSoldOut ? "Esgotado" : "Adicionar ao carrinho"}
          </Button>
        </div>
      </div>
    </div>
  );
}
