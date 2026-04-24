"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@caixa/ui/toast";

import {
  PAYMENT_METHODS,
  PRODUCT_TYPES,
  type PaymentMethod,
  type ProductType,
} from "@caixa/db/schema";
import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";

import { paymentLabel, productTypeLabel } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

interface Initial {
  id: string;
  type: ProductType;
  slug: string;
  title: string;
  description: string | null;
  priceCents: number | null;
  quantity: number;
  lowStockThreshold: number;
  hidden: boolean;
  color: string | null;
  widthMm: number | null;
  heightMm: number | null;
  depthMm: number | null;
  tags: string[];
  paymentMethods: PaymentMethod[];
}

export function ProductForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();

  const [type, setType] = useState<ProductType>(initial?.type ?? "box");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<string>(
    initial?.priceCents != null ? (initial.priceCents / 100).toFixed(2) : "",
  );
  const [quantity, setQuantity] = useState<string>(
    initial?.quantity?.toString() ?? "0",
  );
  const [lowStockThreshold, setLowStockThreshold] = useState<string>(
    initial?.lowStockThreshold?.toString() ?? "3",
  );
  const [color, setColor] = useState(initial?.color ?? "");
  const [widthMm, setWidthMm] = useState<string>(initial?.widthMm?.toString() ?? "");
  const [heightMm, setHeightMm] = useState<string>(initial?.heightMm?.toString() ?? "");
  const [depthMm, setDepthMm] = useState<string>(initial?.depthMm?.toString() ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [hidden, setHidden] = useState(initial?.hidden ?? false);
  const [methods, setMethods] = useState<PaymentMethod[]>(
    initial?.paymentMethods ?? [...PAYMENT_METHODS],
  );

  const create = useMutation(
    trpc.product.create.mutationOptions({
      onSuccess: (row) => {
        toast.success("produto criado");
        qc.invalidateQueries({ queryKey: trpc.product.adminAll.queryKey() });
        if (row?.id) router.push(`/admin/produtos/${row.id}`);
      },
      onError: (err) => toast.error(err.message),
    }),
  );
  const update = useMutation(
    trpc.product.update.mutationOptions({
      onSuccess: () => {
        toast.success("salvo");
        qc.invalidateQueries({ queryKey: trpc.product.adminAll.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const toggleMethod = (m: PaymentMethod) => {
    setMethods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type,
      slug,
      title,
      description: description || null,
      priceCents: price ? Math.round(Number(price) * 100) : null,
      quantity: Number(quantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 0,
      color: color || null,
      widthMm: widthMm ? Number(widthMm) : null,
      heightMm: heightMm ? Number(heightMm) : null,
      depthMm: depthMm ? Number(depthMm) : null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      paymentMethods: methods,
      hidden,
    };
    if (initial) update.mutate({ id: initial.id, patch: payload });
    else create.mutate(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl bg-card p-6 ring-1 ring-border/40">
      <div className="grid gap-4 md:grid-cols-[200px_1fr_1fr]">
        <div className="space-y-2">
          <Label>tipo</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProductType)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {productTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="ex.: caixa-das-maes"
            required
            pattern="[a-z0-9-]+"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>descrição</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>preço (R$)</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="opcional"
            inputMode="decimal"
          />
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
          oculto (não aparece no catálogo)
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>cor</Label>
          <Input value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>largura (mm)</Label>
          <Input value={widthMm} onChange={(e) => setWidthMm(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label>altura (mm)</Label>
          <Input value={heightMm} onChange={(e) => setHeightMm(e.target.value)} inputMode="numeric" />
        </div>
        <div className="space-y-2">
          <Label>profundidade (mm)</Label>
          <Input value={depthMm} onChange={(e) => setDepthMm(e.target.value)} inputMode="numeric" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>tags (separadas por vírgula)</Label>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      <fieldset className="space-y-2">
        <Label>formas de pagamento aceitas</Label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m}
              className={`cursor-pointer rounded-full px-3 py-1 text-sm ring-1 transition ${methods.includes(m) ? "bg-primary text-primary-foreground ring-primary" : "bg-background text-muted-foreground ring-border"}`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={methods.includes(m)}
                onChange={() => toggleMethod(m)}
              />
              {paymentLabel(m)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {initial ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
