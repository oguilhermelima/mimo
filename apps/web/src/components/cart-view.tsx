"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Sparkles, X } from "lucide-react";

import { PAYMENT_METHODS } from "@caixa/db/schema";
import { Button } from "@caixa/ui/button";

import { env } from "~/env";
import { totalCents, useCart } from "~/lib/cart-store";
import { formatBRL, paymentLabel } from "~/lib/format";
import { buildWhatsAppUrl } from "~/lib/whatsapp";
import { useTRPC } from "~/trpc/react";
import { LogoMark } from "./logo";

export function CartView() {
  const entries = useCart((s) => s.entries);
  const remove = useCart((s) => s.remove);
  const setQuantity = useCart((s) => s.setQuantity);
  const clear = useCart((s) => s.clear);

  const trpc = useTRPC();
  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const couponQuery = useQuery(
    trpc.coupon.byCode.queryOptions(
      { code: couponCode.trim().toUpperCase() },
      { enabled: couponCode.trim().length > 0 },
    ),
  );

  const grand = totalCents(entries);
  const coupon = couponQuery.data;
  const couponInvalid = coupon && "_invalid" in coupon;
  const discountCents =
    coupon && !couponInvalid && typeof grand === "number"
      ? coupon.discountType === "percent"
        ? Math.round((grand * coupon.discountValue) / 100)
        : Math.min(grand, coupon.discountValue)
      : 0;
  const finalTotal =
    typeof grand === "number" ? Math.max(0, grand - discountCents) : null;

  if (entries.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/60 bg-gradient-to-br from-muted/30 via-background to-primary/5 p-10 text-center md:p-14">
        <LogoMark className="mx-auto mb-4 size-16 text-primary/40 md:size-20" />
        <p className="font-serif text-2xl text-foreground md:text-3xl">
          Carrinho vazio
        </p>
        <p className="mt-2 text-muted-foreground">
          Comece pelos presentes ou monte uma caixa do zero.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-7 shadow-lg shadow-primary/20">
            <Link href="/produtos">Ver os Presentes</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-7">
            <Link href="/encomenda">Montar a sua caixa</Link>
          </Button>
        </div>
      </div>
    );
  }

  const itemCount = entries.reduce((n, e) => n + e.quantity, 0);

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-4">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-3">
          <h2 className="font-serif text-xl text-foreground md:text-2xl">
            Seus itens
          </h2>
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground md:text-xs">
            {itemCount} {itemCount === 1 ? "item" : "itens"}
          </p>
        </div>

        <ul className="space-y-3">
          {entries.map((entry) => {
            const lineTotal =
              typeof entry.priceCents === "number"
                ? entry.priceCents * entry.quantity
                : null;
            return (
              <li
                key={entry.lineId}
                className="group relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-3 transition hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:p-4 md:p-5"
              >
                <div className="flex gap-3 sm:gap-4 md:gap-5">
                  <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm ring-1 ring-inset ring-border/40 sm:w-24 md:w-28">
                    {entry.imageUrl ? (
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title}
                        fill
                        sizes="(min-width: 768px) 112px, (min-width: 640px) 96px, 80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl font-serif text-primary/30">
                        ✦
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.24em] text-primary/80 sm:gap-2 sm:text-[10px] md:text-xs">
                        <span aria-hidden>✦</span>
                        <span className="truncate">
                          {entry.kind === "bundle" ? "Caixinha pronta" : "Item avulso"}
                        </span>
                      </p>
                      <p className="mt-1 line-clamp-2 break-words font-serif text-base leading-tight text-foreground sm:text-lg md:text-2xl">
                        {entry.title}
                      </p>
                      <div className="mt-1.5 flex flex-col gap-0 leading-tight">
                        <p className="font-serif text-xl text-primary tabular-nums sm:text-2xl md:text-3xl">
                          {formatBRL(lineTotal)}
                        </p>
                        {entry.quantity > 1 && entry.priceCents != null && (
                          <p className="text-[11px] text-muted-foreground">
                            {formatBRL(entry.priceCents)} cada
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-full bg-background ring-1 ring-border/60">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(entry.lineId, entry.quantity - 1)
                          }
                          disabled={entry.quantity <= 1}
                          aria-label="Diminuir quantidade"
                          className="flex size-8 items-center justify-center rounded-full text-foreground/70 transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 sm:size-9"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 select-none text-center text-sm font-medium tabular-nums sm:w-7">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(entry.lineId, entry.quantity + 1)
                          }
                          aria-label="Aumentar quantidade"
                          className="flex size-8 items-center justify-center rounded-full text-foreground/70 transition hover:text-primary sm:size-9"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(entry.lineId)}
                        aria-label="Remover do carrinho"
                        className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[11px] text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive sm:gap-1.5 sm:px-3 sm:text-xs"
                      >
                        <X className="size-3.5" />
                        <span className="hidden sm:inline">Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="h-fit space-y-5 rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-6 ring-1 ring-border/40 lg:sticky lg:top-24">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <Sparkles className="size-4 text-primary" />
            Resumo
          </h2>
          <LogoMark className="size-7 text-primary/60" />
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">
              {grand == null ? "Sob consulta" : formatBRL(grand)}
            </dd>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Cupom {coupon?.code}</dt>
              <dd className="tabular-nums">- {formatBRL(discountCents)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-border/40 pt-3">
            <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Total
            </dt>
            <dd className="font-serif text-2xl text-primary tabular-nums">
              {finalTotal == null ? "Sob consulta" : formatBRL(finalTotal)}
            </dd>
          </div>
        </dl>

        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Cupom
          </label>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="CODIGO"
            className="w-full rounded-full border border-border/70 bg-background px-4 py-2 text-sm uppercase tracking-wide transition focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          {couponCode && couponQuery.data === null && (
            <p className="text-xs text-destructive">Cupom não encontrado.</p>
          )}
          {couponInvalid && (
            <p className="text-xs text-destructive">
              {(coupon as { _invalid?: string })._invalid}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Forma de pagamento
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-full border border-border/70 bg-background px-4 py-2 text-sm transition focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {paymentLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personalizações, cores, bilhete…"
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm transition focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        <Button
          size="lg"
          className="w-full rounded-full shadow-lg shadow-primary/25"
          asChild
        >
          <a
            href={buildWhatsAppUrl({
              entries,
              paymentMethod,
              notes,
              couponCode:
                coupon && !couponInvalid ? coupon.code : undefined,
              storeName: env.NEXT_PUBLIC_STORE_NAME,
              phone: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
            })}
            target="_blank"
            rel="noreferrer"
          >
            Encomendar no WhatsApp
          </a>
        </Button>

        <button
          onClick={clear}
          className="w-full text-xs text-muted-foreground transition hover:text-destructive"
        >
          Esvaziar carrinho
        </button>
      </aside>
    </div>
  );
}
