"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";

import { formatBRL, productTypeLabel } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { Checkbox } from "./checkbox";
import { Sheet } from "./sheet";

type CatalogItem = {
  key: string;
  href: string;
  title: string;
  priceCents: number | null;
  imageUrl: string | null;
  imageAlt: string;
  kind: "bundle" | "product";
  type: string; // "bundle" | ProductType
  outOfStock: boolean;
  lowStock: boolean;
  color: string | null;
  heightMm: number | null;
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "bundle", label: "Caixas prontas" },
  { value: "box", label: "Caixas standalone" },
  { value: "jewelry", label: "Joalheiros" },
  { value: "perfume", label: "Perfumes" },
  { value: "cosmetic", label: "Cosméticos" },
];

type SizeBucket = "small" | "medium" | "large";
const SIZE_BUCKETS: { value: SizeBucket; label: string; max?: number; min?: number }[] = [
  { value: "small", label: "Pequena (até 150mm)", max: 150 },
  { value: "medium", label: "Média (150–200mm)", min: 150, max: 200 },
  { value: "large", label: "Grande (200mm+)", min: 200 },
];

function sizeBucketOf(heightMm: number | null): SizeBucket | null {
  if (heightMm == null) return null;
  if (heightMm < 150) return "small";
  if (heightMm <= 200) return "medium";
  return "large";
}

/** Maps cor name → swatch background. Fallback: muted neutral. */
const COLOR_SWATCHES: Record<string, string> = {
  rosa: "bg-pink-300",
  "rosa-claro": "bg-pink-200",
  "rosa-claro ": "bg-pink-200",
  azul: "bg-sky-300",
  "azul-claro": "bg-sky-200",
  verde: "bg-emerald-300",
  natural: "bg-amber-100",
  branco: "bg-white",
  preto: "bg-zinc-900",
  dourado: "bg-amber-300",
  vermelho: "bg-red-400",
  lilas: "bg-violet-300",
};

function swatchClass(color: string | null): string {
  if (!color) return "bg-muted";
  const normalized = color.trim().toLowerCase();
  return COLOR_SWATCHES[normalized] ?? "bg-muted";
}

export function ProductsPage() {
  const trpc = useTRPC();
  const [bundles, products] = useSuspenseQueries({
    queries: [
      trpc.bundle.catalogList.queryOptions(),
      trpc.product.catalog.queryOptions(),
    ],
  });

  const items = useMemo<CatalogItem[]>(
    () => [
      ...bundles.data.map((b) => {
        const img = b.media[0] ?? b.templateBox?.media[0];
        return {
          key: `bundle-${b.id}`,
          href: `/caixa/${b.slug}`,
          title: b.title,
          priceCents: b.effectivePriceCents,
          imageUrl: img?.url ?? null,
          imageAlt: img?.alt ?? b.title,
          kind: "bundle" as const,
          type: "bundle",
          outOfStock: b.quantity <= 0,
          lowStock: b.quantity > 0 && b.quantity <= b.lowStockThreshold,
          color: b.templateBox?.color ?? null,
          heightMm: b.templateBox?.heightMm ?? null,
        };
      }),
      ...products.data
        .filter((p) => p.type !== "template_box")
        .map((p) => {
          const img = p.media[0];
          return {
            key: `product-${p.id}`,
            href: `/produto/${p.slug}`,
            title: p.title,
            priceCents: p.priceCents,
            imageUrl: img?.url ?? null,
            imageAlt: img?.alt ?? p.title,
            kind: "product" as const,
            type: p.type,
            outOfStock: p.quantity <= 0,
            lowStock: p.quantity > 0 && p.quantity <= p.lowStockThreshold,
            color: p.color ?? null,
            heightMm: p.heightMm ?? null,
          };
        }),
    ],
    [bundles.data, products.data],
  );

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if (it.color) set.add(it.color.trim().toLowerCase());
    }
    return Array.from(set).sort();
  }, [items]);

  const availableSizes = useMemo(() => {
    const set = new Set<SizeBucket>();
    for (const it of items) {
      const b = sizeBucketOf(it.heightMm);
      if (b) set.add(b);
    }
    return SIZE_BUCKETS.filter((b) => set.has(b.value));
  }, [items]);

  const priceBounds = useMemo(() => {
    let min = Infinity;
    let max = 0;
    for (const it of items) {
      if (typeof it.priceCents === "number") {
        if (it.priceCents < min) min = it.priceCents;
        if (it.priceCents > max) max = it.priceCents;
      }
    }
    if (min === Infinity) return { min: 0, max: 0 };
    return { min: Math.floor(min / 100), max: Math.ceil(max / 100) };
  }, [items]);

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<SizeBucket>>(new Set());
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [query, setQuery] = useState("");

  const toggleSet = <T extends string>(
    set: Set<T>,
    setter: (next: Set<T>) => void,
    value: T,
  ) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const filtered = useMemo(() => {
    const minReais = priceMin ? Number(priceMin) : null;
    const maxReais = priceMax ? Number(priceMax) : null;

    return items.filter((it) => {
      if (selectedTypes.size > 0 && !selectedTypes.has(it.type)) return false;
      if (
        selectedColors.size > 0 &&
        (!it.color || !selectedColors.has(it.color.trim().toLowerCase()))
      )
        return false;
      if (selectedSizes.size > 0) {
        const b = sizeBucketOf(it.heightMm);
        if (!b || !selectedSizes.has(b)) return false;
      }
      if (inStockOnly && it.outOfStock) return false;
      if (typeof it.priceCents === "number") {
        if (minReais != null && it.priceCents / 100 < minReais) return false;
        if (maxReais != null && it.priceCents / 100 > maxReais) return false;
      } else if (minReais != null || maxReais != null) {
        return false;
      }
      if (query.trim().length > 0) {
        const q = query.trim().toLowerCase();
        if (!it.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [
    items,
    selectedTypes,
    selectedColors,
    selectedSizes,
    priceMin,
    priceMax,
    inStockOnly,
    query,
  ]);

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setSelectedColors(new Set());
    setSelectedSizes(new Set());
    setPriceMin("");
    setPriceMax("");
    setInStockOnly(false);
    setQuery("");
  };

  const activeFilterCount =
    selectedTypes.size +
    selectedColors.size +
    selectedSizes.size +
    (priceMin !== "" ? 1 : 0) +
    (priceMax !== "" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (query.trim().length > 0 ? 1 : 0);

  const hasFilters = activeFilterCount > 0;

  const [sheetOpen, setSheetOpen] = useState(false);

  const filterPanel = (
    <div className="space-y-8">
      <FilterSection label="Buscar">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome da caixa, item…"
                className="h-10 w-full rounded-full border border-border/70 bg-background pl-9 pr-3 text-sm transition-colors focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </FilterSection>

          <FilterSection label="Categoria">
            <ul className="space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.value}>
                  <Checkbox
                    checked={selectedTypes.has(c.value)}
                    onChange={() =>
                      toggleSet(selectedTypes, setSelectedTypes, c.value)
                    }
                    label={c.label}
                  />
                </li>
              ))}
            </ul>
          </FilterSection>

          <FilterSection label="Preço">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder={`Min R$${priceBounds.min}`}
                inputMode="numeric"
                className="h-10 rounded-full border border-border/70 bg-background px-3 text-sm focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <input
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder={`Máx R$${priceBounds.max}`}
                inputMode="numeric"
                className="h-10 rounded-full border border-border/70 bg-background px-3 text-sm focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </FilterSection>

          {availableColors.length > 0 && (
            <FilterSection label="Cor">
              <ul className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const checked = selectedColors.has(color);
                  return (
                    <li key={color}>
                      <button
                        type="button"
                        onClick={() =>
                          toggleSet(selectedColors, setSelectedColors, color)
                        }
                        className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                          checked
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/70 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`size-4 rounded-full ring-1 ring-border/60 ${swatchClass(color)}`}
                        />
                        <span className="capitalize">{color}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </FilterSection>
          )}

          {availableSizes.length > 0 && (
            <FilterSection label="Tamanho">
              <ul className="space-y-2.5">
                {availableSizes.map((s) => (
                  <li key={s.value}>
                    <Checkbox
                      checked={selectedSizes.has(s.value)}
                      onChange={() =>
                        toggleSet(selectedSizes, setSelectedSizes, s.value)
                      }
                      label={s.label}
                    />
                  </li>
                ))}
              </ul>
            </FilterSection>
          )}

          <FilterSection label="Disponibilidade">
            <Checkbox
              checked={inStockOnly}
              onChange={setInStockOnly}
              label="Em estoque"
            />
          </FilterSection>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-xs text-muted-foreground underline hover:text-primary"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl text-primary md:text-5xl">Produtos</h1>
        <p className="text-muted-foreground">
          Caixas prontas, itens avulsos e tudo que vai dentro de uma encomenda.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          {filterPanel}
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "item" : "itens"}
            </p>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-foreground transition hover:border-primary/50 hover:text-primary lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold leading-none text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10 text-center text-muted-foreground">
              Nenhum item encontrado com esses filtros.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((it, i) => (
                <li
                  key={it.key}
                  className="animate-fade-slide-up min-w-0"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <Link href={it.href} className="group block">
                    <div
                      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted/50 ring-1 ring-border/40 transition-[box-shadow,ring] duration-500 group-hover:ring-primary/50"
                      style={{
                        isolation: "isolate",
                        transform: "translateZ(0)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {it.imageUrl ? (
                        <Image
                          src={it.imageUrl}
                          alt={it.imageAlt}
                          fill
                          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw"
                          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-serif text-sm text-muted-foreground">
                          sem foto
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-col gap-1">
                        {it.outOfStock && (
                          <span className="rounded-full bg-background/90 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground ring-1 ring-border">
                            esgotado
                          </span>
                        )}
                        {it.lowStock && !it.outOfStock && (
                          <span className="rounded-full bg-primary/90 px-2 py-1 text-[10px] uppercase tracking-wide text-primary-foreground">
                            últimas unidades
                          </span>
                        )}
                      </div>
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full bg-background/90 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground ring-1 ring-border/60">
                          {it.kind === "bundle"
                            ? "caixa"
                            : productTypeLabel(it.type)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 min-w-0 px-1">
                      <p className="truncate font-serif text-xl leading-tight text-foreground transition group-hover:text-primary">
                        {it.title}
                      </p>
                      <p className="mt-1 font-serif text-2xl text-primary">
                        {formatBRL(it.priceCents)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filtros"
        subtitle={
          activeFilterCount > 0
            ? `${activeFilterCount} ${activeFilterCount === 1 ? "ativo" : "ativos"}`
            : undefined
        }
        footer={
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Ver {filtered.length}{" "}
            {filtered.length === 1 ? "resultado" : "resultados"}
          </button>
        }
      >
        {filterPanel}
      </Sheet>
    </div>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        {label}
      </p>
      {children}
    </div>
  );
}
