"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
} from "@tanstack/react-query";
import { toast } from "@caixa/ui/toast";

import { BUNDLE_SOURCES, type BundleSource } from "@caixa/db/schema";
import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";

import { bundleSourceLabel, formatBRL } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

interface BundleItemDraft {
  productId: string;
  quantity: number;
  sortOrder: number;
}

interface Initial {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  source: BundleSource;
  templateBoxId: string | null;
  stampId: string | null;
  priceCents: number | null;
  quantity: number;
  lowStockThreshold: number;
  hidden: boolean;
  customerName: string | null;
  customerNote: string | null;
  items: {
    id: string;
    productId: string;
    quantity: number;
    sortOrder: number;
  }[];
}

export function BundleForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();

  const [templates, stamps, products] = useSuspenseQueries({
    queries: [
      trpc.product.adminAll.queryOptions({ type: "template_box" }),
      trpc.stamp.adminAll.queryOptions(),
      trpc.product.adminAll.queryOptions(),
    ],
  });

  const productOptions = useMemo(
    () =>
      products.data.filter(
        (p) => p.type !== "template_box" && !p.hidden,
      ),
    [products.data],
  );

  const [source, setSource] = useState<BundleSource>(initial?.source ?? "catalog");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [templateBoxId, setTemplateBoxId] = useState(initial?.templateBoxId ?? "");
  const [stampId, setStampId] = useState(initial?.stampId ?? "");
  const [price, setPrice] = useState<string>(
    initial?.priceCents != null ? (initial.priceCents / 100).toFixed(2) : "",
  );
  const [quantity, setQuantity] = useState<string>(
    initial?.quantity?.toString() ?? "0",
  );
  const [lowStockThreshold, setLowStockThreshold] = useState<string>(
    initial?.lowStockThreshold?.toString() ?? "3",
  );
  const [hidden, setHidden] = useState(initial?.hidden ?? false);
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [customerNote, setCustomerNote] = useState(initial?.customerNote ?? "");
  const [items, setItems] = useState<BundleItemDraft[]>(
    initial?.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        sortOrder: it.sortOrder,
      })) ?? [],
  );
  const [newItemProductId, setNewItemProductId] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");

  const create = useMutation(
    trpc.bundle.create.mutationOptions({
      onSuccess: (row) => {
        toast.success("caixa criada");
        qc.invalidateQueries({ queryKey: trpc.bundle.adminAll.queryKey() });
        if (row?.id) router.push(`/admin/caixas/${row.id}`);
      },
      onError: (err) => toast.error(err.message),
    }),
  );
  const update = useMutation(
    trpc.bundle.update.mutationOptions({
      onSuccess: () => {
        toast.success("salvo");
        qc.invalidateQueries({ queryKey: trpc.bundle.adminAll.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const addItem = () => {
    if (!newItemProductId) return;
    const quantityNum = Number(newItemQty) || 1;
    setItems((prev) => [
      ...prev,
      {
        productId: newItemProductId,
        quantity: quantityNum,
        sortOrder: prev.length,
      },
    ]);
    setNewItemProductId("");
    setNewItemQty("1");
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, sortOrder: i })));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      source,
      slug: slug || null,
      title,
      description: description || null,
      templateBoxId: templateBoxId || null,
      stampId: stampId || null,
      priceCents: price ? Math.round(Number(price) * 100) : null,
      quantity: Number(quantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 0,
      hidden,
      customerName: customerName || null,
      customerNote: customerNote || null,
      items,
    };
    if (initial) update.mutate({ id: initial.id, patch: payload });
    else create.mutate(payload);
  };

  const itemsTotalCents = items.reduce((sum, it) => {
    const prod = productOptions.find((p) => p.id === it.productId);
    return sum + (prod?.priceCents ?? 0) * it.quantity;
  }, 0);

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-2xl bg-card p-6 ring-1 ring-border/40"
    >
      <div className="grid gap-4 md:grid-cols-[180px_1fr_1fr]">
        <div className="space-y-2">
          <Label>origem</Label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as BundleSource)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {BUNDLE_SOURCES.map((s) => (
              <option key={s} value={s}>
                {bundleSourceLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>título</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>slug {source === "catalog" ? "(obrigatório)" : "(opcional)"}</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="caixa-das-maes"
            pattern="[a-z0-9-]+"
            required={source === "catalog"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>descrição</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>caixa base (template_box)</Label>
          <select
            value={templateBoxId}
            onChange={(e) => setTemplateBoxId(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">— selecione —</option>
            {templates.data.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>estampa (opcional)</Label>
          <select
            value={stampId}
            onChange={(e) => setStampId(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">— nenhuma —</option>
            {stamps.data.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>preço (R$)</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="vazio = soma dos itens"
            inputMode="decimal"
          />
          {!price && items.length > 0 && (
            <p className="text-xs text-muted-foreground">
              soma = {formatBRL(itemsTotalCents)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>estoque</Label>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <div className="space-y-2">
          <Label>limite baixo</Label>
          <Input
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            className="size-4 accent-primary"
          />
          oculta
        </label>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-border/60 p-4">
        <legend className="px-2 font-serif text-sm text-primary">
          Itens incluídos
        </legend>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">nenhum item ainda</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it, idx) => {
              const prod = productOptions.find((p) => p.id === it.productId);
              return (
                <li
                  key={`${it.productId}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2"
                >
                  <div>
                    <p className="text-sm">
                      {it.quantity > 1 ? `${it.quantity}× ` : ""}
                      {prod?.title ?? it.productId}
                    </p>
                    {prod?.priceCents != null && (
                      <p className="text-xs text-muted-foreground">
                        {formatBRL(prod.priceCents)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remover
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="grid grid-cols-[1fr_80px_auto] items-end gap-2">
          <div className="space-y-1">
            <Label>produto</Label>
            <select
              value={newItemProductId}
              onChange={(e) => setNewItemProductId(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">— selecione —</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatBRL(p.priceCents)})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>qtd</Label>
            <Input
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              inputMode="numeric"
            />
          </div>
          <Button type="button" variant="outline" onClick={addItem}>
            Adicionar
          </Button>
        </div>
      </fieldset>

      {source === "user_order" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>cliente</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>observações</Label>
            <Input
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {initial ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
