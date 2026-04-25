"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Ruler,
  ShoppingBag,
} from "lucide-react";
import { toast } from "@caixa/ui/toast";

import { Button } from "@caixa/ui/button";

import { useCart } from "~/lib/cart-store";
import { formatBRL, formatDimensions } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { LogoMonogram } from "./logo";

export function ProductDetail({ slug }: { slug: string }) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.product.bySlug.queryOptions({ slug }),
  );
  const add = useCart((s) => s.add);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

  const { data: latestHistory } = useQuery(
    trpc.priceHistory.latest.queryOptions({
      entityType: "product",
      entityId: product.id,
    }),
  );

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

  const gallery = product.media;
  const dims = formatDimensions(
    product.widthMm,
    product.heightMm,
    product.depthMm,
  );

  const previousPriceCents =
    latestHistory &&
    typeof product.priceCents === "number" &&
    latestHistory.priceCents > product.priceCents
      ? latestHistory.priceCents
      : null;

  const isSoldOut = product.quantity <= 0;
  const isLowStock =
    !isSoldOut && product.quantity <= product.lowStockThreshold;

  const handleAdd = () => {
    if (isSoldOut) return;
    add({
      kind: "product",
      itemId: product.id,
      title: product.title,
      priceCents: product.priceCents,
      imageUrl: gallery[0]?.url ?? null,
    });
    toast.success(`${product.title} adicionado ao carrinho`);
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
                      <video
                        src={m.url}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={m.url}
                        alt={m.alt ?? product.title}
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
                  className="absolute left-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-lg ring-1 ring-border/60 backdrop-blur transition hover:bg-background hover:text-primary disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-0 md:group-hover/gallery:opacity-100"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    goToMedia(
                      Math.min(gallery.length - 1, currentMediaIdx + 1),
                    )
                  }
                  disabled={currentMediaIdx === gallery.length - 1}
                  aria-label="próxima foto"
                  className="absolute right-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-lg ring-1 ring-border/60 backdrop-blur transition hover:bg-background hover:text-primary disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-0 md:group-hover/gallery:opacity-100"
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
              {product.title}
            </h1>
            <div className="mt-3 flex items-baseline gap-3">
              <p className="font-serif text-3xl text-foreground">
                {formatBRL(product.priceCents)}
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
                  últimas {product.quantity} unidades
                </span>
              ) : null}
              {previousPriceCents != null && (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-wide text-emerald-700">
                  promoção
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {(product.color || dims) && (
            <div className="grid grid-cols-2 gap-3">
              {product.color && (
                <div className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border/40">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    <Palette className="size-3.5" />
                    Cor
                  </div>
                  <p className="mt-2 font-serif text-lg text-foreground">
                    {product.color}
                  </p>
                </div>
              )}
              {dims && (
                <div className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border/40">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    <Ruler className="size-3.5" />
                    Dimensões
                  </div>
                  <p className="mt-2 font-serif text-lg text-foreground">
                    {dims}
                  </p>
                </div>
              )}
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
