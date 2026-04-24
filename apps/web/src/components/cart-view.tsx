"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

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
  const setChildren = useCart((s) => s.setChildren);
  const clear = useCart((s) => s.clear);

  const trpc = useTRPC();
  const childIds = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.childIds))),
    [entries],
  );
  const { data: childProducts } = useQuery(
    trpc.product.byIds.queryOptions({ ids: childIds }),
  );

  const [paymentMethod, setPaymentMethod] = useState<string>("pix");
  const [notes, setNotes] = useState("");

  const grand = totalCents(entries);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 p-10 text-center">
        <LogoMark className="mx-auto mb-4 size-14 text-primary/50" />
        <p className="text-muted-foreground">
          Carrinho vazio.{" "}
          <Link href="/" className="text-primary hover:underline">
            Ver Catálogo
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="space-y-4">
        {entries.map((entry) => {
          const childDetails = childProducts?.filter((p) =>
            entry.childIds.includes(p.id),
          );
          return (
            <li
              key={entry.lineId}
              className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/40"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                {entry.imageUrl && (
                  <Image
                    src={entry.imageUrl}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-lg">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatBRL(entry.priceCents)}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(entry.lineId)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remover
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Qtd.</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={entry.quantity}
                    onChange={(e) =>
                      setQuantity(entry.lineId, Number(e.target.value))
                    }
                    className="h-8 w-16 rounded-md border border-border bg-background px-2 text-sm"
                  />
                </div>

                {childDetails && childDetails.length > 0 && (
                  <details className="mt-2 rounded-lg bg-primary/5 p-3 text-sm">
                    <summary className="cursor-pointer font-serif text-primary">
                      Itens da Caixinha ({childDetails.length})
                    </summary>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      {childDetails.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between"
                        >
                          <span>{c.title}</span>
                          <button
                            onClick={() =>
                              setChildren(
                                entry.lineId,
                                entry.childIds.filter((id) => id !== c.id),
                              )
                            }
                            className="text-xs hover:text-destructive"
                          >
                            Remover
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit space-y-4 rounded-2xl bg-card p-6 ring-1 ring-border/40">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">Resumo</h2>
          <LogoMark className="size-8 text-primary/70" />
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-serif text-lg text-primary">
              {grand == null ? "sob consulta" : formatBRL(grand)}
            </dd>
          </div>
        </dl>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Forma de Pagamento
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {paymentLabel(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Observações
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="personalizações, cores, bilhete…"
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <Button size="lg" className="w-full" asChild>
          <a
            href={buildWhatsAppUrl({
              entries,
              paymentMethod,
              notes,
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
          className="w-full text-xs text-muted-foreground hover:text-destructive"
        >
          Esvaziar Carrinho
        </button>
      </aside>
    </div>
  );
}
