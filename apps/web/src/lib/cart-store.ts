"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartEntry {
  /** Linha do carrinho (uuid gerado no client, não o produto) */
  lineId: string;
  productId: string;
  title: string;
  priceCents: number | null;
  quantity: number;
  /** Para "montar caixinha": ids dos filhos inclusos */
  childIds: string[];
  imageUrl: string | null;
}

interface CartState {
  entries: CartEntry[];
  add: (entry: Omit<CartEntry, "lineId" | "quantity"> & { quantity?: number }) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  setChildren: (lineId: string, childIds: string[]) => void;
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
      setChildren: (lineId, childIds) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.lineId === lineId ? { ...e, childIds } : e,
          ),
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: "caixa-cart-v1" },
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
