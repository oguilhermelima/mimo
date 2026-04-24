"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartKind = "product" | "bundle";

export interface CartEntry {
  /** Linha do carrinho (uuid gerado no client). */
  lineId: string;
  /** Referência ao item: produto standalone ou bundle catalog. */
  kind: CartKind;
  itemId: string;
  title: string;
  priceCents: number | null;
  quantity: number;
  imageUrl: string | null;
}

interface CartState {
  entries: CartEntry[];
  add: (entry: Omit<CartEntry, "lineId" | "quantity"> & { quantity?: number }) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      entries: [],
      add: (entry) =>
        set((s) => ({
          entries: [
            ...s.entries,
            {
              ...entry,
              quantity: entry.quantity ?? 1,
              lineId: crypto.randomUUID(),
            },
          ],
        })),
      remove: (lineId) =>
        set((s) => ({ entries: s.entries.filter((e) => e.lineId !== lineId) })),
      setQuantity: (lineId, quantity) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.lineId === lineId ? { ...e, quantity: Math.max(1, quantity) } : e,
          ),
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: "caixa-cart-v2" },
  ),
);

export function totalCents(entries: CartEntry[]): number | null {
  let total = 0;
  let hasUnknown = false;
  for (const e of entries) {
    if (e.priceCents == null) hasUnknown = true;
    else total += e.priceCents * e.quantity;
  }
  return hasUnknown ? null : total;
}
