"use client";

import Image from "next/image";
import Link from "next/link";
import { useSuspenseQueries } from "@tanstack/react-query";

import { formatBRL } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

type CatalogCard = {
  key: string;
  href: string;
  title: string;
  priceCents: number | null;
  imageUrl: string | null;
  imageAlt: string;
  kind: "bundle" | "product";
  outOfStock: boolean;
  lowStock: boolean;
};

export function Catalog() {
  const trpc = useTRPC();
  const [bundles, products] = useSuspenseQueries({
    queries: [
      trpc.bundle.catalogList.queryOptions(),
      trpc.product.catalog.queryOptions({ type: "box" }),
    ],
  });

  const cards: CatalogCard[] = [
    ...bundles.data.map((b): CatalogCard => {
      const img = b.media[0] ?? b.templateBox?.media[0];
      return {
        key: `bundle-${b.id}`,
        href: `/caixa/${b.slug}`,
        title: b.title,
        priceCents: b.effectivePriceCents,
        imageUrl: img?.url ?? null,
        imageAlt: img?.alt ?? b.title,
        kind: "bundle",
        outOfStock: b.quantity <= 0,
        lowStock: b.quantity > 0 && b.quantity <= b.lowStockThreshold,
      };
    }),
    ...products.data.map((p): CatalogCard => {
      const img = p.media[0];
      return {
        key: `product-${p.id}`,
        href: `/produto/${p.slug}`,
        title: p.title,
        priceCents: p.priceCents,
        imageUrl: img?.url ?? null,
        imageAlt: img?.alt ?? p.title,
        kind: "product",
        outOfStock: p.quantity <= 0,
        lowStock: p.quantity > 0 && p.quantity <= p.lowStockThreshold,
      };
    }),
  ];

  if (cards.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10 text-center text-muted-foreground">
        Nenhuma caixinha por aqui ainda. Volte em breve ✨
      </p>
    );
  }

  return (
    <ul className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:max-w-none sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {cards.map((c) => (
        <li key={c.key} className="min-w-0">
          <Link href={c.href} className="group block">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/50 ring-1 ring-border/40 transition-[box-shadow,ring] duration-500 group-hover:ring-primary/50">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt={c.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-serif text-sm text-muted-foreground">
                  Sem foto
                </div>
              )}
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {c.outOfStock && (
                  <span className="rounded-full bg-background/90 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground ring-1 ring-border">
                    esgotado
                  </span>
                )}
                {c.lowStock && !c.outOfStock && (
                  <span className="rounded-full bg-primary/90 px-2 py-1 text-[10px] uppercase tracking-wide text-primary-foreground">
                    últimas unidades
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 min-w-0 px-1">
              <p className="truncate font-serif text-xl leading-tight text-foreground transition group-hover:text-primary">
                {c.title}
              </p>
              <p className="mt-1 font-serif text-2xl text-primary">
                {formatBRL(c.priceCents)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
