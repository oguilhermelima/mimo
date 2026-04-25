"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { Button } from "@caixa/ui/button";
import { toast } from "@caixa/ui/toast";

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

export function AdminOrderDetail({ id }: { id: string }) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data: order } = useSuspenseQuery(
    trpc.order.adminById.queryOptions({ id }),
  );

  const invalidate = async () => {
    await qc.invalidateQueries({
      queryKey: trpc.order.adminById.queryKey({ id }),
    });
    await qc.invalidateQueries({
      queryKey: trpc.order.adminAll.queryKey(),
    });
  };

  const markPaid = useMutation(
    trpc.order.adminMarkPaid.mutationOptions({
      onSuccess: async () => {
        toast.success("marcado como pago");
        await invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const markFulfilled = useMutation(
    trpc.order.adminMarkFulfilled.mutationOptions({
      onSuccess: async () => {
        toast.success("marcado como entregue");
        await invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const cancel = useMutation(
    trpc.order.adminCancel.mutationOptions({
      onSuccess: async () => {
        toast.success("pedido cancelado e estoque devolvido");
        await invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const [reason, setReason] = useState("");

  const canPay =
    order.status === "reservado" || order.status === "aguardando_pagamento";
  const canFulfill = order.status === "pago";
  const canCancel = order.status !== "cancelado" && order.status !== "entregue";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/pedidos"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm transition"
        >
          <ChevronLeft className="size-4" /> Lista
        </Link>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground font-mono text-xs">#{order.id}</p>
          <p className="text-muted-foreground text-sm">
            Criado em {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase ring-1 ${
            STATUS_TONE[order.status] ?? STATUS_TONE.cancelado
          }`}
        >
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="border-border/40 bg-card/30 space-y-1 rounded-2xl border p-5 text-sm">
          <h3 className="font-serif text-lg">Cliente</h3>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-muted-foreground">{order.customerEmail}</p>
          <p className="text-muted-foreground">
            Tel: {formatPhone(order.customerPhone)}
          </p>
          <p className="text-muted-foreground">
            CPF: {formatCpf(order.customerCpf)}
          </p>
        </div>
        <div className="border-border/40 bg-card/30 space-y-1 rounded-2xl border p-5 text-sm">
          <h3 className="font-serif text-lg">Recebimento</h3>
          <p>{FULFILLMENT_LABEL[order.fulfillmentMethod]}</p>
          {order.fulfillmentMethod === "delivery" && order.deliverStreet && (
            <div className="text-muted-foreground">
              <p>
                {order.deliverStreet}, {order.deliverNumber}
                {order.deliverComplement ? ` — ${order.deliverComplement}` : ""}
              </p>
              <p>
                {order.deliverDistrict} · {order.deliverCity}/
                {order.deliverState}
              </p>
              {order.deliverPostalCode && (
                <p>CEP: {formatCep(order.deliverPostalCode)}</p>
              )}
              {order.deliverRecipientName && (
                <p>Recebe: {order.deliverRecipientName}</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border-border/40 bg-card/30 space-y-3 rounded-2xl border p-5">
        <h3 className="font-serif text-lg">Itens</h3>
        <ul className="divide-border/40 divide-y">
          {order.items.map((it) => (
            <li
              key={it.id}
              className="flex items-start justify-between gap-4 py-3"
            >
              <div className="flex-1">
                <p className="text-primary/80 text-[10px] tracking-[0.2em] uppercase">
                  {KIND_LABEL[it.kind] ?? it.kind}
                </p>
                <p className="font-medium">{it.titleSnapshot}</p>
                {it.bundle?.items && it.bundle.items.length > 0 && (
                  <ul className="text-muted-foreground mt-1.5 space-y-0.5 text-xs">
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
                <p className="text-primary font-serif text-lg tabular-nums">
                  {formatBRL(it.priceCentsSnapshot * it.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="border-border/40 space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatBRL(order.subtotalCents)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Cupom {order.couponCodeSnapshot}</dt>
              <dd className="tabular-nums">
                - {formatBRL(order.discountCents)}
              </dd>
            </div>
          )}
          <div className="border-border/40 flex items-baseline justify-between border-t pt-2">
            <dt className="text-muted-foreground text-[10px] tracking-[0.28em] uppercase">
              Total
            </dt>
            <dd className="text-primary font-serif text-2xl tabular-nums">
              {formatBRL(order.totalCents)}
            </dd>
          </div>
        </dl>
        <p className="text-muted-foreground text-xs">
          Pagamento: {paymentLabel(order.paymentMethod)}
        </p>
      </section>

      {order.customerNote && (
        <section className="border-border/40 bg-card/30 rounded-2xl border p-5 text-sm">
          <h3 className="mb-2 font-serif text-lg">Observações</h3>
          <p className="text-muted-foreground whitespace-pre-line">
            {order.customerNote}
          </p>
        </section>
      )}

      <section className="border-primary/15 bg-primary/5 space-y-3 rounded-2xl border p-5">
        <h3 className="font-serif text-lg">Ações</h3>
        <div className="flex flex-wrap gap-2">
          {canPay && (
            <Button
              type="button"
              onClick={() => markPaid.mutate({ id: order.id })}
              disabled={markPaid.isPending}
            >
              Marcar como pago
            </Button>
          )}
          {canFulfill && (
            <Button
              type="button"
              variant="outline"
              onClick={() => markFulfilled.mutate({ id: order.id })}
              disabled={markFulfilled.isPending}
            >
              Marcar como entregue
            </Button>
          )}
          {canCancel && (
            <details className="w-full">
              <summary className="border-destructive/40 text-destructive cursor-pointer rounded-full border px-4 py-1.5 text-sm">
                Cancelar pedido
              </summary>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="motivo (opcional)"
                  className="border-border/70 bg-background flex-1 rounded-full border px-4 py-2 text-sm"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        "Cancelar pedido e devolver estoque? Essa ação não pode ser desfeita.",
                      )
                    ) {
                      cancel.mutate({
                        id: order.id,
                        reason: reason.trim() || undefined,
                      });
                    }
                  }}
                  disabled={cancel.isPending}
                >
                  Confirmar cancelamento
                </Button>
              </div>
            </details>
          )}
        </div>
        {order.status === "reservado" && (
          <p className="text-muted-foreground text-xs">
            Reservado até{" "}
            {new Date(order.reservedUntil).toLocaleString("pt-BR")}.
          </p>
        )}
      </section>
    </div>
  );
}

function formatCep(raw: string) {
  const cep = raw.padStart(8, "0");
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

function formatPhone(raw: string) {
  const d = raw.padStart(10, "0");
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

function formatCpf(raw: string) {
  const d = raw.padStart(11, "0");
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
