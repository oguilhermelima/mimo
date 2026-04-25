"use client";

import { useState } from "react";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ORDER_STATUSES, type OrderStatus } from "@caixa/db/schema";

import { formatBRL } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

const STATUS_LABEL: Record<string, string> = {
  reservado: "Reservado",
  aguardando_pagamento: "Aguardando pgto",
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

export function AdminOrderList() {
  const trpc = useTRPC();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const { data: orders } = useSuspenseQuery(
    trpc.order.adminAll.queryOptions(
      filter === "all" ? undefined : { status: filter },
    ),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label="Todos"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {ORDER_STATUSES.map((s) => (
          <FilterPill
            key={s}
            label={STATUS_LABEL[s] ?? s}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          Nenhum pedido por aqui.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/40">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Pedido</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Itens</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.map((o) => {
                const itemsCount = o.items.reduce(
                  (n, it) => n + it.quantity,
                  0,
                );
                return (
                  <tr key={o.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link
                        href={`/admin/pedidos/${o.id}`}
                        className="text-primary hover:underline"
                      >
                        #{o.id.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {itemsCount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatBRL(o.totalCents)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ring-1 ${
                          STATUS_TONE[o.status] ?? STATUS_TONE.cancelado
                        }`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-4 py-1.5 text-xs text-primary-foreground"
          : "rounded-full bg-muted/60 px-4 py-1.5 text-xs text-muted-foreground ring-1 ring-border/60 transition hover:bg-primary/10 hover:text-primary"
      }
    >
      {label}
    </button>
  );
}
