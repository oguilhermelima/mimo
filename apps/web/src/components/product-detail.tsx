"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Palette,
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
import { GlitterOverlay } from "./ornaments";

export function ProductDetail({ slug }: { slug: string }) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.product.bySlug.queryOptions({ slug }),
  );
  const add = useCart((s) => s.add);
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(
    new Set(),
  );
  const galleryRef = useRef<HTMLDivElement>(null);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

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
  const hasChildren = product.children.length > 0;

  const selectedChildItems = useMemo(
    () => product.children.filter((c) => selectedChildren.has(c.id)),
    [product.children, selectedChildren],
  );

  const childrenPriceCents = useMemo(
    () =>
      selectedChildItems.reduce((sum, c) => sum + (c.priceCents ?? 0), 0),
    [selectedChildItems],
  );

  const totalPriceCents =
    product.priceCents == null
      ? null
      : product.priceCents + childrenPriceCents;

  const toggleChild = (id: string) => {
    setSelectedChildren((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    add({
      productId: product.id,
      title: product.title,
      priceCents: totalPriceCents,
      childIds: Array.from(selectedChildren),
      imageUrl: gallery[0]?.url ?? null,
    });
    toast.success(`${product.title} adicionada ao carrinho`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm text-muted-foreground ring-1 ring-border/60 transition hover:bg-primary/10 hover:text-primary hover:ring-primary/30"
        >
          <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" />
          Voltar ao Catálogo
        </Link>
        <LogoMonogram className="hidden h-7 w-auto text-primary/60 sm:block md:h-8" />
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
                    sem mídia
                  </div>
                </div>
              ) : (
                gallery.map((m) => (
                  <div
                    key={m.id}
                    className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden rounded-3xl bg-muted/50 ring-1 ring-border/40"
                    style={{
                      isolation: "isolate",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                    }}
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
                {/* seta esquerda (desktop) */}
                <button
                  type="button"
                  onClick={() => goToMedia(Math.max(0, currentMediaIdx - 1))}
                  disabled={currentMediaIdx === 0}
                  aria-label="foto anterior"
                  className="absolute left-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-lg ring-1 ring-border/60 backdrop-blur transition hover:bg-background hover:text-primary disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-0 md:group-hover/gallery:opacity-100"
                >
                  <ChevronLeft className="size-5" />
                </button>

                {/* seta direita (desktop) */}
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
                {formatBRL(totalPriceCents)}
              </p>
              {childrenPriceCents > 0 && product.priceCents != null && (
                <p className="text-sm text-muted-foreground">
                  caixa {formatBRL(product.priceCents)} + itens{" "}
                  {formatBRL(childrenPriceCents)}
                </p>
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

          {hasChildren && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="flex items-center gap-2 font-serif text-xl text-primary">
                  <Sparkles className="size-4" />
                  Monte Sua Caixinha
                </h3>
                {selectedChildItems.length > 0 && (
                  <span className="text-xs text-primary/80">
                    {selectedChildItems.length} selecionado
                    {selectedChildItems.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                deslize e toque para incluir — o preço soma automaticamente
              </p>
              <div className="relative mt-4">
                <ul className="scrollbar-hide -mx-5 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-px-5 px-5 py-2">
                  {product.children.map((child) => {
                    const checked = selectedChildren.has(child.id);
                    const thumb = child.media[0];
                    return (
                      <li
                        key={child.id}
                        className="flex w-[44%] shrink-0 snap-start sm:w-[32%] md:w-[46%] lg:w-[32%]"
                      >
                        <button
                          type="button"
                          onClick={() => toggleChild(child.id)}
                          className={`group relative flex w-full min-w-0 flex-col gap-2 rounded-xl bg-background p-2 text-left ring-2 transition ${
                            checked
                              ? "z-10 ring-primary shadow-md shadow-primary/20"
                              : "ring-border hover:ring-primary/40"
                          }`}
                        >
                          <div
                            className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-muted"
                            style={{
                              isolation: "isolate",
                              transform: "translateZ(0)",
                              backfaceVisibility: "hidden",
                            }}
                          >
                            {thumb ? (
                              <Image
                                src={thumb.url}
                                alt={thumb.alt ?? child.title}
                                fill
                                sizes="180px"
                                className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center font-serif text-xs text-muted-foreground">
                                sem foto
                              </div>
                            )}
                            <GlitterOverlay />
                            <span
                              className={`absolute right-2 top-2 z-10 flex size-7 items-center justify-center rounded-full ring-2 transition ${
                                checked
                                  ? "bg-primary text-primary-foreground ring-primary"
                                  : "bg-background/90 text-transparent ring-border"
                              }`}
                              aria-hidden
                            >
                              <Check
                                className={`size-4 transition ${checked ? "opacity-100" : "opacity-0"}`}
                              />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 px-1 pb-1">
                            <p className="line-clamp-2 min-h-[2.4em] break-words font-serif text-sm leading-tight text-foreground">
                              {child.title}
                            </p>
                            {child.priceCents != null && (
                              <p className="text-xs font-medium text-primary">
                                + {formatBRL(child.priceCents)}
                              </p>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {/* gradiente fade direito */}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-primary/5 via-primary/[0.03] to-transparent" />
              </div>
            </div>
          )}

          <Button onClick={handleAdd} size="lg" className="mt-2 gap-2">
            <ShoppingBag className="size-4" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}
