"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSuspenseQueries } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { Button } from "@caixa/ui/button";
import { toast } from "@caixa/ui/toast";

import { useCart } from "~/lib/cart-store";
import { formatBRL, formatDimensions } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

type StepKey = "template" | "stamp" | "items" | "confirm";
const STEPS: { key: StepKey; label: string }[] = [
  { key: "template", label: "Caixa base" },
  { key: "stamp", label: "Estampa" },
  { key: "items", label: "Conteúdo" },
  { key: "confirm", label: "Revisar" },
];

export function CustomOrderFlow() {
  const trpc = useTRPC();
  const router = useRouter();
  const addToCart = useCart((s) => s.add);

  const [templates, stamps, contents] = useSuspenseQueries({
    queries: [
      trpc.product.publicTemplateBoxes.queryOptions(),
      trpc.stamp.listAvailable.queryOptions(),
      trpc.product.publicContents.queryOptions(),
    ],
  });

  const [step, setStep] = useState<StepKey>("template");
  const [templateBoxId, setTemplateBoxId] = useState<string>("");
  const [stampId, setStampId] = useState<string | null>(null);
  const [itemQtys, setItemQtys] = useState<Record<string, number>>({});

  const selectedTemplate = templates.data.find((p) => p.id === templateBoxId);
  const selectedStamp = stamps.data.find((s) => s.id === stampId) ?? null;

  const selectedItems = useMemo(
    () =>
      contents.data
        .filter((p) => (itemQtys[p.id] ?? 0) > 0)
        .map((p) => ({ product: p, quantity: itemQtys[p.id] ?? 0 })),
    [contents.data, itemQtys],
  );

  const totalCents = useMemo(() => {
    let total = 0;
    if (selectedTemplate?.priceCents) total += selectedTemplate.priceCents;
    if (selectedStamp?.priceCents) total += selectedStamp.priceCents;
    for (const it of selectedItems) {
      total += (it.product.priceCents ?? 0) * it.quantity;
    }
    return total;
  }, [selectedTemplate, selectedStamp, selectedItems]);

  const bumpItem = (id: string, delta: number) => {
    setItemQtys((prev) => {
      const next = { ...prev };
      const cur = next[id] ?? 0;
      const val = Math.max(0, cur + delta);
      if (val === 0) delete next[id];
      else next[id] = val;
      return next;
    });
  };

  const canAdvance = () => {
    if (step === "template") return !!templateBoxId;
    if (step === "stamp") return true;
    if (step === "items") return selectedItems.length > 0;
    if (step === "confirm")
      return !!selectedTemplate && selectedItems.length > 0;
    return false;
  };

  const nextStep = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    const next = STEPS[idx + 1];
    if (next) setStep(next.key);
  };
  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.key === step);
    const prev = STEPS[idx - 1];
    if (prev) setStep(prev.key);
  };

  const handleAddToCart = () => {
    if (!selectedTemplate || selectedItems.length === 0) return;

    const titleParts = [selectedTemplate.title];
    if (selectedStamp) titleParts.push(`com ${selectedStamp.name}`);
    const title = `Encomenda — ${titleParts.join(" ")}`;

    const imageUrl =
      selectedTemplate.media[0]?.url ??
      selectedStamp?.imageUrl ??
      selectedItems[0]?.product.media[0]?.url ??
      null;

    addToCart({
      kind: "custom_box",
      itemId: crypto.randomUUID(),
      title,
      priceCents: totalCents > 0 ? totalCents : null,
      imageUrl,
      customBox: {
        templateBoxId: selectedTemplate.id,
        stampId: selectedStamp?.id ?? null,
        items: selectedItems.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        })),
      },
    });

    toast.success("caixinha adicionada ao carrinho");
    router.push("/carrinho");
  };

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-8 pb-40 md:pb-36">
      <header className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-primary font-serif text-4xl md:text-5xl">
            Monte sua caixinha
          </h1>
          <p className="text-muted-foreground mt-2 md:text-lg">
            Escolha a caixa, a estampa e os itens — depois é só finalizar a
            compra.
          </p>
        </div>

        <ol className="relative mx-auto flex w-full items-start justify-between gap-1 px-2">
          <div
            aria-hidden
            className="bg-border/50 absolute top-5 right-[12.5%] left-[12.5%] -z-0 h-0.5 rounded-full md:top-7"
          >
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{
                width: `${(currentIdx / (STEPS.length - 1)) * 100}%`,
              }}
            />
          </div>

          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const active = s.key === step;
            return (
              <li
                key={s.key}
                className="relative z-10 flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full font-serif text-base font-semibold transition-all duration-300 md:size-14 md:text-lg ${
                    active
                      ? "bg-primary text-primary-foreground ring-primary/30 shadow-primary/30 scale-110 shadow-lg ring-4"
                      : done
                        ? "bg-primary text-primary-foreground ring-primary/40 ring-2"
                        : "bg-background text-muted-foreground ring-border/50 ring-2"
                  }`}
                >
                  {done ? <Check className="size-5 md:size-6" /> : i + 1}
                </div>
                <span
                  className={`text-center text-[10px] font-semibold tracking-[0.18em] uppercase transition md:text-xs ${
                    active
                      ? "text-primary"
                      : done
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </header>

      {step === "template" && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-foreground font-serif text-3xl font-medium md:text-4xl">
              Comece pela base
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              A casa do presente — em MDF cru, pronta pra receber sua história.
            </p>
          </div>
          {templates.data.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhuma caixa crua disponível no momento.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {templates.data.map((t) => {
                const checked = templateBoxId === t.id;
                const dims = formatDimensions(t.widthMm, t.heightMm, t.depthMm);
                return (
                  <li key={t.id} className="h-full">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setTemplateBoxId(t.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setTemplateBoxId(t.id);
                        }
                      }}
                      className={`group bg-card focus-visible:ring-primary flex h-full w-full cursor-pointer flex-col rounded-2xl p-2.5 text-left ring-2 transition focus:outline-none sm:p-3 ${
                        checked
                          ? "ring-primary shadow-primary/20 shadow-md"
                          : "ring-border/40 hover:ring-primary/40"
                      }`}
                    >
                      <div className="relative">
                        <TemplateGallery photos={t.media} title={t.title} />
                        {checked && (
                          <span className="bg-primary text-primary-foreground pointer-events-none absolute top-2 right-2 z-20 flex size-8 items-center justify-center rounded-full shadow-md">
                            <Check className="size-4" />
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5 sm:mt-4 sm:gap-1.5 sm:px-1">
                        <p className="text-foreground line-clamp-2 font-serif text-sm leading-snug font-medium break-words sm:text-lg md:text-xl">
                          {t.title}
                        </p>
                        {dims && (
                          <p className="text-foreground/75 text-[11px] font-medium tracking-wide sm:text-sm md:text-base">
                            {dims}
                          </p>
                        )}
                        <p className="text-primary mt-auto font-serif text-base font-medium tabular-nums sm:text-xl md:text-2xl">
                          {formatBRL(t.priceCents)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {step === "stamp" && (
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-foreground font-serif text-3xl font-medium md:text-4xl">
                Um toque na tampa
              </h2>
              <span className="border-border/60 bg-muted/40 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.22em] uppercase">
                Opcional
              </span>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              Estampa decorativa pra dar identidade à caixinha — flores,
              partituras, gaiolas vintage.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <li>
              <button
                type="button"
                onClick={() => setStampId(null)}
                className={`bg-muted/20 flex h-full min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 text-center transition sm:p-6 ${
                  stampId === null
                    ? "border-primary text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                <Sparkles className="mb-2 size-6" />
                <p className="font-serif text-base sm:text-lg">Sem estampa</p>
              </button>
            </li>
            {stamps.data.map((s) => {
              const checked = stampId === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStampId(s.id)}
                    className={`group bg-card w-full rounded-2xl p-2.5 text-left ring-2 transition sm:p-3 ${
                      checked
                        ? "ring-primary shadow-primary/20 shadow-md"
                        : "ring-border/40 hover:ring-primary/40"
                    }`}
                  >
                    <div className="bg-muted relative aspect-[4/5] w-full overflow-hidden rounded-xl">
                      {s.imageUrl ? (
                        <Image
                          src={s.imageUrl}
                          alt={s.name}
                          fill
                          sizes="(min-width: 640px) 320px, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center font-serif text-sm">
                          sem foto
                        </div>
                      )}
                      {checked && (
                        <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-7 items-center justify-center rounded-full sm:size-8">
                          <Check className="size-3.5 sm:size-4" />
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-0.5 px-0.5 sm:space-y-1 sm:px-1">
                      <p className="line-clamp-2 font-serif text-sm leading-snug break-words sm:text-lg">
                        {s.name}
                      </p>
                      {s.priceCents != null && (
                        <p className="text-primary text-xs tabular-nums sm:text-sm">
                          + {formatBRL(s.priceCents)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {step === "items" && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-foreground font-serif text-3xl font-medium md:text-4xl">
              Os mimos lá dentro
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Escolha quem vai abrir a caixinha junto com a pessoa — um colar,
              uma Bíblia, um perfume.
            </p>
          </div>
          {contents.data.length === 0 ? (
            <p className="text-muted-foreground">Nenhum item disponível.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {contents.data.map((p) => {
                const qty = itemQtys[p.id] ?? 0;
                const selected = qty > 0;
                return (
                  <li key={p.id} className="h-full">
                    <div
                      className={`group bg-card flex h-full w-full flex-col rounded-2xl p-2.5 text-left ring-2 transition sm:p-3 ${
                        selected
                          ? "ring-primary shadow-primary/20 shadow-md"
                          : "ring-border/40 hover:ring-primary/40"
                      }`}
                    >
                      <div className="relative">
                        <TemplateGallery photos={p.media} title={p.title} />
                        {selected && (
                          <span className="bg-primary text-primary-foreground pointer-events-none absolute top-2 right-2 z-20 flex size-7 items-center justify-center rounded-full shadow-md sm:size-8">
                            <Check className="size-3.5 sm:size-4" />
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5 sm:mt-4 sm:gap-1.5 sm:px-1">
                        <p className="text-foreground line-clamp-2 font-serif text-sm leading-snug font-medium break-words sm:text-lg md:text-xl">
                          {p.title}
                        </p>
                        <p className="text-primary mt-auto font-serif text-base font-medium tabular-nums sm:text-xl md:text-2xl">
                          {formatBRL(p.priceCents)}
                        </p>
                      </div>
                      <div className="bg-muted/40 ring-border/40 mt-2.5 flex items-center justify-between rounded-full px-1 py-1 ring-1 sm:mt-3 sm:px-1.5 sm:py-1.5">
                        <button
                          type="button"
                          onClick={() => bumpItem(p.id, -1)}
                          disabled={qty === 0}
                          aria-label="Diminuir quantidade"
                          className="bg-background text-foreground ring-border/60 hover:bg-primary/10 hover:text-primary flex size-7 items-center justify-center rounded-full ring-1 transition disabled:cursor-not-allowed disabled:opacity-40 sm:size-9"
                        >
                          <Minus className="size-3.5 sm:size-4" />
                        </button>
                        <span className="text-sm font-semibold tabular-nums sm:text-base">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => bumpItem(p.id, 1)}
                          disabled={qty >= p.quantity}
                          aria-label="Aumentar quantidade"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 flex size-7 items-center justify-center rounded-full shadow transition disabled:cursor-not-allowed disabled:opacity-40 sm:size-9"
                        >
                          <Plus className="size-3.5 sm:size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <FloatingFooter
        expanded={step === "confirm"}
        selectedTemplate={selectedTemplate}
        selectedStamp={selectedStamp}
        selectedItems={selectedItems}
        totalCents={totalCents}
        onPrev={prevStep}
        onNext={nextStep}
        onSubmit={handleAddToCart}
        canAdvance={canAdvance()}
        isFirstStep={currentIdx === 0}
      />
    </div>
  );
}

function FloatingFooter({
  expanded,
  selectedTemplate,
  selectedStamp,
  selectedItems,
  totalCents,
  onPrev,
  onNext,
  onSubmit,
  canAdvance,
  isFirstStep,
}: {
  expanded: boolean;
  selectedTemplate:
    | {
        id: string;
        title: string;
        priceCents: number | null;
        media: { id: string; url: string; alt: string | null }[];
      }
    | undefined;
  selectedStamp: {
    id: string;
    name: string;
    priceCents: number | null;
    imageUrl: string | null;
  } | null;
  selectedItems: {
    product: {
      id: string;
      title: string;
      priceCents: number | null;
      media: { url: string; alt: string | null }[];
    };
    quantity: number;
  }[];
  totalCents: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canAdvance: boolean;
  isFirstStep: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasSelection =
    !!selectedTemplate || !!selectedStamp || selectedItems.length > 0;
  const itemCount =
    (selectedTemplate ? 1 : 0) +
    (selectedStamp ? 1 : 0) +
    selectedItems.reduce((n, it) => n + it.quantity, 0);

  const showList = expanded || (open && hasSelection);

  return (
    <>
      {expanded && (
        <div
          aria-hidden
          className="bg-foreground/50 fixed inset-0 z-[55] backdrop-blur-sm transition-opacity duration-500"
        />
      )}

      <div
        className={`fixed transition-all duration-500 ease-out ${
          expanded
            ? "inset-0 z-[60] lg:inset-x-auto lg:top-1/2 lg:right-auto lg:bottom-auto lg:left-1/2 lg:max-h-[88vh] lg:w-[calc(100%-3rem)] lg:max-w-2xl lg:-translate-x-1/2 lg:-translate-y-1/2"
            : "inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+3.75rem)] z-40 lg:bottom-0"
        }`}
      >
        <div
          className={`bg-background mx-auto flex flex-col shadow-[0_-12px_40px_-15px_rgba(0,0,0,0.55)] transition-all duration-500 ${
            expanded
              ? "border-primary/25 lg:shadow-primary/20 h-full overflow-hidden border lg:rounded-3xl lg:shadow-2xl"
              : "border-primary/20 w-full max-w-3xl border-t backdrop-blur-md md:rounded-t-3xl md:border-x"
          }`}
        >
          {expanded ? (
            <div className="border-border/40 from-card via-card to-primary/5 flex items-center justify-between gap-3 border-b bg-gradient-to-br px-5 py-4 md:px-7">
              <div className="flex items-center gap-3">
                <span className="bg-primary text-primary-foreground shadow-primary/30 flex size-9 items-center justify-center rounded-full shadow-md">
                  <Sparkles className="size-4" />
                </span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-foreground font-serif text-lg md:text-2xl">
                    Conferir a caixinha
                  </span>
                  <span className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase md:text-xs">
                    Última conferida antes de adicionar ao carrinho
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Voltar"
                className="text-muted-foreground hover:bg-primary/10 hover:text-primary flex size-9 items-center justify-center rounded-full transition"
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              disabled={!hasSelection}
              className="hover:bg-primary/5 flex w-full items-center justify-between gap-3 px-5 py-3.5 transition disabled:cursor-default disabled:hover:bg-transparent md:px-7 md:py-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full transition ${
                    hasSelection ? "" : "opacity-40"
                  }`}
                >
                  <ChevronUp
                    className={`size-4 transition-transform duration-300 ${
                      open ? "rotate-0" : "rotate-180"
                    }`}
                  />
                </span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-foreground font-serif text-base md:text-lg">
                    Sua caixa
                  </span>
                  <span className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase md:text-xs">
                    {hasSelection
                      ? `${itemCount} ${itemCount === 1 ? "item" : "itens"}`
                      : "Comece escolhendo a caixa"}
                  </span>
                </div>
              </div>
              {hasSelection && (
                <span className="text-primary font-serif text-xl md:text-2xl">
                  {formatBRL(totalCents)}
                </span>
              )}
            </button>
          )}

          {showList && (
            <div
              className={`flex-1 overflow-y-auto ${
                expanded
                  ? "px-5 py-5 md:px-7"
                  : "border-border/40 bg-muted/20 max-h-64 border-t px-5 py-3 md:max-h-80 md:px-7"
              }`}
            >
              <ul className={expanded ? "space-y-3" : "space-y-2"}>
                {selectedTemplate &&
                  (expanded ? (
                    <ConfirmRow
                      kind="Caixa base"
                      title={selectedTemplate.title}
                      imageUrl={selectedTemplate.media[0]?.url ?? null}
                      priceCents={selectedTemplate.priceCents}
                    />
                  ) : (
                    <SelectionRow
                      kind="Caixa"
                      title={selectedTemplate.title}
                      imageUrl={selectedTemplate.media[0]?.url ?? null}
                      priceCents={selectedTemplate.priceCents}
                    />
                  ))}
                {selectedStamp &&
                  (expanded ? (
                    <ConfirmRow
                      kind="Estampa"
                      title={selectedStamp.name}
                      imageUrl={selectedStamp.imageUrl}
                      priceCents={selectedStamp.priceCents}
                    />
                  ) : (
                    <SelectionRow
                      kind="Estampa"
                      title={selectedStamp.name}
                      imageUrl={selectedStamp.imageUrl}
                      priceCents={selectedStamp.priceCents}
                    />
                  ))}
                {selectedItems.map((it) =>
                  expanded ? (
                    <ConfirmRow
                      key={it.product.id}
                      kind={it.quantity > 1 ? `Item × ${it.quantity}` : "Item"}
                      title={it.product.title}
                      imageUrl={it.product.media[0]?.url ?? null}
                      priceCents={
                        (it.product.priceCents ?? 0) * it.quantity || null
                      }
                    />
                  ) : (
                    <SelectionRow
                      key={it.product.id}
                      kind={it.quantity > 1 ? `Item × ${it.quantity}` : "Item"}
                      title={it.product.title}
                      imageUrl={it.product.media[0]?.url ?? null}
                      priceCents={
                        (it.product.priceCents ?? 0) * it.quantity || null
                      }
                    />
                  ),
                )}
              </ul>

              {expanded && (
                <div className="border-border/40 mt-5 flex items-baseline justify-between border-t pt-4">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.28em] uppercase md:text-xs">
                    Total
                  </span>
                  <span className="text-primary font-serif text-3xl md:text-4xl">
                    {formatBRL(totalCents)}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="border-border/40 flex items-center gap-3 border-t px-5 py-3 md:px-7 md:py-3.5">
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={isFirstStep && !expanded}
            >
              Voltar
            </Button>
            <div className="flex-1" />
            {expanded ? (
              <Button
                type="button"
                size="lg"
                onClick={onSubmit}
                disabled={!canAdvance}
                className="shadow-primary/25 gap-2 px-6 shadow-md"
              >
                <ShoppingBag className="size-4" />
                Adicionar ao carrinho
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onNext}
                disabled={!canAdvance}
                className="shadow-primary/25 px-6 shadow-md"
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SelectionRow({
  kind,
  title,
  imageUrl,
  priceCents,
}: {
  kind: string;
  title: string;
  imageUrl: string | null;
  priceCents: number | null;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="bg-background ring-border/50 relative size-14 shrink-0 overflow-hidden rounded-lg ring-1">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="text-primary/40 flex h-full items-center justify-center text-xl">
            ✦
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-primary/80 text-[11px] font-semibold tracking-[0.22em] uppercase md:text-xs">
          {kind}
        </p>
        <p className="text-foreground truncate font-serif text-base leading-tight md:text-lg">
          {title}
        </p>
      </div>
      {priceCents != null && priceCents > 0 && (
        <p className="text-foreground shrink-0 font-serif text-base md:text-lg">
          {formatBRL(priceCents)}
        </p>
      )}
    </li>
  );
}

function ConfirmRow({
  kind,
  title,
  imageUrl,
  priceCents,
}: {
  kind: string;
  title: string;
  imageUrl: string | null;
  priceCents: number | null;
}) {
  return (
    <li className="bg-background/60 ring-border/40 flex items-center gap-4 rounded-2xl p-3 ring-1">
      <div className="bg-muted ring-border/40 relative size-16 shrink-0 overflow-hidden rounded-xl ring-1 md:size-20">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 768px) 80px, 64px"
            className="object-cover"
          />
        ) : (
          <div className="text-primary/40 flex h-full items-center justify-center text-2xl">
            ✦
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-primary/80 text-[10px] font-semibold tracking-[0.24em] uppercase md:text-xs">
          {kind}
        </p>
        <p className="text-foreground mt-1 font-serif text-base leading-tight md:text-lg">
          {title}
        </p>
      </div>
      {priceCents != null && priceCents > 0 && (
        <p className="text-foreground shrink-0 font-serif text-base md:text-lg">
          {formatBRL(priceCents)}
        </p>
      )}
    </li>
  );
}

function TemplateGallery({
  photos,
  title,
}: {
  photos: { id: string; url: string; alt: string | null }[];
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="bg-muted text-muted-foreground relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-xl font-serif text-sm">
        Sem foto
      </div>
    );
  }

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIdx(i);
  };

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="group/gal relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto rounded-xl"
      >
        {photos.map((p) => (
          <div
            key={p.id}
            className="bg-muted relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden"
          >
            <Image
              src={p.url}
              alt={p.alt ?? title}
              fill
              sizes="320px"
              className="object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              goTo(Math.max(0, idx - 1));
            }}
            disabled={idx === 0}
            aria-label="foto anterior"
            className="bg-background/85 text-foreground ring-border/60 hover:bg-background hover:text-primary absolute top-1/2 left-2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md ring-1 backdrop-blur transition disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-0 md:group-hover/gal:opacity-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              stop(e);
              goTo(Math.min(photos.length - 1, idx + 1));
            }}
            disabled={idx === photos.length - 1}
            aria-label="próxima foto"
            className="bg-background/85 text-foreground ring-border/60 hover:bg-background hover:text-primary absolute top-1/2 right-2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md ring-1 backdrop-blur transition disabled:pointer-events-none disabled:opacity-0 md:flex md:opacity-0 md:group-hover/gal:opacity-100"
          >
            <ChevronRight className="size-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => {
                  stop(e);
                  goTo(i);
                }}
                aria-label={`foto ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === idx
                    ? "bg-primary w-5"
                    : "bg-background/85 ring-border/40 hover:bg-primary/50 w-1.5 ring-1"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
