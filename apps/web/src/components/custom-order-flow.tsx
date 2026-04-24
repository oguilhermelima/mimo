"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import { Check, Minus, Plus, Sparkles } from "lucide-react";
import { toast } from "@caixa/ui/toast";

import { PAYMENT_METHODS, type PaymentMethod } from "@caixa/db/schema";
import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";

import { env } from "~/env";
import { formatBRL, paymentLabel } from "~/lib/format";
import { buildCustomOrderUrl } from "~/lib/whatsapp";
import { useTRPC } from "~/trpc/react";

type StepKey = "template" | "stamp" | "items" | "confirm";
const STEPS: { key: StepKey; label: string }[] = [
  { key: "template", label: "Caixa base" },
  { key: "stamp", label: "Estampa" },
  { key: "items", label: "Conteúdo" },
  { key: "confirm", label: "Conferir" },
];

export function CustomOrderFlow() {
  const trpc = useTRPC();
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
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

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
    if (selectedTemplate?.priceCents)
      total += selectedTemplate.priceCents;
    if (selectedStamp?.priceCents) total += selectedStamp.priceCents;
    for (const it of selectedItems) {
      total += (it.product.priceCents ?? 0) * it.quantity;
    }
    return total;
  }, [selectedTemplate, selectedStamp, selectedItems]);

  const submitOrder = useMutation(
    trpc.bundle.createUserOrder.mutationOptions({
      onSuccess: (bundle) => {
        toast.success("encomenda registrada — abrindo WhatsApp…");
        const url = buildCustomOrderUrl({
          customerName,
          templateBoxTitle: selectedTemplate?.title ?? "",
          stampName: selectedStamp?.name ?? null,
          items: selectedItems.map((it) => ({
            title: it.product.title,
            priceCents: it.product.priceCents,
            quantity: it.quantity,
          })),
          priceCents: bundle.effectivePriceCents,
          note: customerNote || null,
          paymentMethod,
          storeName: env.NEXT_PUBLIC_STORE_NAME,
          phone: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
        });
        window.open(url, "_blank");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

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
    if (step === "confirm") return customerName.length > 0;
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

  const handleSubmit = () => {
    submitOrder.mutate({
      templateBoxId,
      stampId: stampId ?? null,
      items: selectedItems.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
      })),
      customerName,
      customerNote: customerNote || undefined,
      paymentMethod,
    });
  };

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div>
          <h1 className="font-serif text-4xl text-primary">Monte sua caixinha</h1>
          <p className="mt-2 text-muted-foreground">
            escolha a caixa, a estampa e os itens — a gente finaliza pelo
            WhatsApp
          </p>
        </div>

        <ol className="flex flex-wrap gap-2">
          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const active = s.key === step;
            return (
              <li
                key={s.key}
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${
                  active
                    ? "bg-primary text-primary-foreground ring-primary"
                    : done
                      ? "bg-primary/10 text-primary ring-primary/30"
                      : "bg-muted/40 text-muted-foreground ring-border/40"
                }`}
              >
                <span className="flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                  {done ? <Check className="size-3" /> : i + 1}
                </span>
                {s.label}
              </li>
            );
          })}
        </ol>
      </header>

      {step === "template" && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-foreground">
            Qual caixa você quer?
          </h2>
          {templates.data.length === 0 ? (
            <p className="text-muted-foreground">
              nenhuma caixa crua disponível no momento
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.data.map((t) => {
                const checked = templateBoxId === t.id;
                const thumb = t.media[0];
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setTemplateBoxId(t.id)}
                      className={`group w-full rounded-2xl bg-card p-3 text-left ring-2 transition ${
                        checked
                          ? "ring-primary shadow-md shadow-primary/20"
                          : "ring-border/40 hover:ring-primary/40"
                      }`}
                    >
                      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
                        {thumb ? (
                          <Image
                            src={thumb.url}
                            alt={thumb.alt ?? t.title}
                            fill
                            sizes="320px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-serif text-sm text-muted-foreground">
                            sem foto
                          </div>
                        )}
                        {checked && (
                          <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-4" />
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1 px-1">
                        <p className="font-serif text-lg">{t.title}</p>
                        <p className="text-sm text-primary">
                          {formatBRL(t.priceCents)}
                        </p>
                        {t.media.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            {t.media.length} fotos de exemplo
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {step === "stamp" && (
        <section className="space-y-4">
          <h2 className="font-serif text-2xl text-foreground">
            Quer uma estampa? <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li>
              <button
                type="button"
                onClick={() => setStampId(null)}
                className={`h-full w-full rounded-2xl border-2 border-dashed bg-muted/20 p-6 text-center transition ${
                  stampId === null
                    ? "border-primary text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                <Sparkles className="mx-auto mb-2 size-6" />
                <p className="font-serif text-lg">sem estampa</p>
              </button>
            </li>
            {stamps.data.map((s) => {
              const checked = stampId === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStampId(s.id)}
                    className={`group w-full rounded-2xl bg-card p-3 text-left ring-2 transition ${
                      checked
                        ? "ring-primary shadow-md shadow-primary/20"
                        : "ring-border/40 hover:ring-primary/40"
                    }`}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
                      {s.imageUrl ? (
                        <Image
                          src={s.imageUrl}
                          alt={s.name}
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-serif text-sm text-muted-foreground">
                          sem foto
                        </div>
                      )}
                      {checked && (
                        <span className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-4" />
                        </span>
                      )}
                    </div>
                    <div className="mt-3 space-y-1 px-1">
                      <p className="font-serif text-lg">{s.name}</p>
                      {s.priceCents != null && (
                        <p className="text-sm text-primary">
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
          <h2 className="font-serif text-2xl text-foreground">
            O que vai dentro?
          </h2>
          {contents.data.length === 0 ? (
            <p className="text-muted-foreground">nenhum item disponível</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contents.data.map((p) => {
                const qty = itemQtys[p.id] ?? 0;
                const thumb = p.media[0];
                return (
                  <li
                    key={p.id}
                    className={`flex flex-col gap-3 rounded-2xl bg-card p-3 ring-1 transition ${
                      qty > 0 ? "ring-primary" : "ring-border/40"
                    }`}
                  >
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
                      {thumb ? (
                        <Image
                          src={thumb.url}
                          alt={thumb.alt ?? p.title}
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-serif text-xs text-muted-foreground">
                          sem foto
                        </div>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2 px-1">
                      <div>
                        <p className="font-serif text-sm leading-tight">
                          {p.title}
                        </p>
                        <p className="text-xs text-primary">
                          {formatBRL(p.priceCents)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 px-1">
                      <button
                        type="button"
                        onClick={() => bumpItem(p.id, -1)}
                        disabled={qty === 0}
                        className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground ring-1 ring-border/60 transition hover:bg-primary/10 hover:text-primary disabled:opacity-40"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="text-sm font-medium">{qty}</span>
                      <button
                        type="button"
                        onClick={() => bumpItem(p.id, 1)}
                        disabled={qty >= p.quantity}
                        className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {step === "confirm" && (
        <section className="space-y-5 rounded-2xl bg-card p-6 ring-1 ring-border/40">
          <h2 className="font-serif text-2xl text-foreground">Confira sua encomenda</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Caixa base</span>
              <span>{selectedTemplate?.title}</span>
            </div>
            {selectedStamp && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estampa</span>
                <span>{selectedStamp.name}</span>
              </div>
            )}
            <div className="border-t border-border/40 pt-2">
              <p className="mb-1 text-muted-foreground">Itens</p>
              <ul className="space-y-1">
                {selectedItems.map((it) => (
                  <li key={it.product.id} className="flex justify-between">
                    <span>
                      {it.quantity > 1 ? `${it.quantity}× ` : ""}
                      {it.product.title}
                    </span>
                    <span className="text-muted-foreground">
                      {formatBRL((it.product.priceCents ?? 0) * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-3">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-lg text-primary">
                {formatBRL(totalCents)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>seu nome</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>pagamento</Label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {paymentLabel(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>observações (opcional)</Label>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="bilhete, personalizações, cores…"
            />
          </div>
        </section>
      )}

      <footer className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentIdx === 0}
        >
          Voltar
        </Button>
        {step === "confirm" ? (
          <Button
            type="button"
            size="lg"
            onClick={handleSubmit}
            disabled={!canAdvance() || submitOrder.isPending}
          >
            Enviar encomenda
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={nextStep}
            disabled={!canAdvance()}
          >
            Continuar
          </Button>
        )}
      </footer>
    </div>
  );
}
