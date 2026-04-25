"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartKind = "product" | "bundle" | "custom_box";

export interface CustomBoxComposition {
  templateBoxId: string;
  stampId: string | null;
  items: { productId: string; quantity: number }[];
}

export interface CartEntry {
  /** Linha do carrinho (uuid gerado no client). */
  lineId: string;
  /** Referência ao item: produto avulso, bundle do catálogo, ou caixa montada. */
  kind: CartKind;
  /**
   * Para kind="product" → Product.id.
   * Para kind="bundle" → Bundle.id (catalog).
   * Para kind="custom_box" → string sintético (não usado pelo backend; composition envia tudo).
   */
  itemId: string;
  title: string;
  priceCents: number | null;
  quantity: number;
  imageUrl: string | null;
  /** Apenas para kind="custom_box". */
  customBox?: CustomBoxComposition;
}

interface CartState {
  entries: CartEntry[];
  add: (
    entry: Omit<CartEntry, "lineId" | "quantity"> & { quantity?: number },
  ) => void;
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
    { name: "caixa-cart-v3" },
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
