"use client";

import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { formatBRL, paymentLabel } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

const STATUS_LABEL: Record<string, string> = {
  reservado: "Reservado",
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_TONE: Record<string, string> = {
  reservado: "bg-amber-100 text-amber-900 ring-amber-300/50",
  aguardando_pagamento: "bg-amber-100 text-amber-900 ring-amber-300/50",
  pago: "bg-emerald-100 text-emerald-900 ring-emerald-300/50",
  entregue: "bg-emerald-100 text-emerald-900 ring-emerald-300/50",
  cancelado: "bg-muted text-muted-foreground ring-border/60",
};

const FULFILLMENT_LABEL: Record<string, string> = {
  delivery: "Entrega no endereço",
  pickup_taboao: "Retirada em Taboão da Serra/SP",
};

const KIND_LABEL: Record<string, string> = {
  product: "Item avulso",
  bundle: "Caixinha pronta",
  custom_box: "Caixinha personalizada",
};

export function OrderDetail({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data: order } = useSuspenseQuery(
    trpc.order.byId.queryOptions({ id }),
  );

  const reservedUntil = new Date(order.reservedUntil);
  const isReserved = order.status === "reservado";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/conta?tab=pedidos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ChevronLeft className="size-4" /> Voltar
        </Link>
      </div>

      <header className="space-y-3">
        <p className="font-mono text-xs text-muted-foreground">
          Pedido #{order.id.slice(0, 8)}
        </p>
        <h1 className="font-serif text-4xl text-primary md:text-5xl">
          {STATUS_LABEL[order.status] ?? order.status}
        </h1>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1 ${
            STATUS_TONE[order.status] ?? STATUS_TONE.cancelado
          }`}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
        {isReserved && (
          <p className="text-sm text-muted-foreground">
            Itens reservados até{" "}
            <strong className="text-foreground">
              {reservedUntil.toLocaleString("pt-BR")}
            </strong>
            . Em breve entramos em contato pelo WhatsApp para confirmar o
            pagamento e a entrega.
          </p>
        )}
      </header>

      <section className="space-y-3 rounded-2xl border border-border/40 bg-card/30 p-5">
        <h2 className="font-serif text-lg">Itens</h2>
        <ul className="divide-y divide-border/40">
          {order.items.map((it) => (
            <li
              key={it.id}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80">
                  {KIND_LABEL[it.kind] ?? it.kind}
                </p>
                <p className="font-medium">{it.titleSnapshot}</p>
                {it.bundle?.items && it.bundle.items.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                    {it.bundle.templateBox && (
                      <li>Caixa: {it.bundle.templateBox.title}</li>
                    )}
                    {it.bundle.stamp && (
                      <li>Estampa: {it.bundle.stamp.name}</li>
                    )}
                    {it.bundle.items.map((bi) => (
                      <li key={bi.id}>
                        · {bi.quantity}× {bi.product.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="text-muted-foreground">{it.quantity}×</p>
                <p className="font-serif text-lg text-primary tabular-nums">
                  {formatBRL(it.priceCentsSnapshot * it.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-border/40 bg-card/30 p-5 text-sm">
          <h3 className="font-serif text-lg">Recebimento</h3>
          <p>{FULFILLMENT_LABEL[order.fulfillmentMethod]}</p>
          {order.fulfillmentMethod === "delivery" && order.deliverStreet && (
            <div className="mt-1 text-muted-foreground">
              <p>
                {order.deliverStreet}, {order.deliverNumber}
                {order.deliverComplement ? ` — ${order.deliverComplement}` : ""}
              </p>
              <p>
                {order.deliverDistrict} · {order.deliverCity}/
                {order.deliverState} ·{" "}
                {order.deliverPostalCode &&
                  formatCep(order.deliverPostalCode)}
              </p>
            </div>
          )}
          {order.fulfillmentMethod === "pickup_taboao" && (
            <p className="text-muted-foreground">
              Endereço de retirada combinado pelo WhatsApp.
            </p>
          )}
        </div>

        <div className="space-y-1 rounded-2xl border border-border/40 bg-card/30 p-5 text-sm">
          <h3 className="font-serif text-lg">Pagamento</h3>
          <p>{paymentLabel(order.paymentMethod)}</p>
          {order.couponCodeSnapshot && (
            <p className="text-emerald-700">
              Cupom {order.couponCodeSnapshot} — desconto de{" "}
              {formatBRL(order.discountCents)}
            </p>
          )}
          <dl className="mt-3 space-y-1 border-t border-border/40 pt-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">
                {formatBRL(order.subtotalCents)}
              </dd>
            </div>
            {order.discountCents > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Desconto</dt>
                <dd className="tabular-nums">
                  - {formatBRL(order.discountCents)}
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-border/40 pt-2">
              <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Total
              </dt>
              <dd className="font-serif text-2xl text-primary tabular-nums">
                {formatBRL(order.totalCents)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {order.customerNote && (
        <section className="rounded-2xl border border-border/40 bg-card/30 p-5 text-sm">
          <h3 className="mb-2 font-serif text-lg">Observações</h3>
          <p className="whitespace-pre-line text-muted-foreground">
            {order.customerNote}
          </p>
        </section>
      )}
    </div>
  );
}

function formatCep(raw: string) {
  const cep = raw.padStart(8, "0");
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}
