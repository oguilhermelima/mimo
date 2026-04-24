"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@caixa/ui/toast";

import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";

import { useTRPC } from "~/trpc/react";

interface Initial {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  quantity: number;
  lowStockThreshold: number;
  hidden: boolean;
}

export function StampForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
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
  const [uploading, setUploading] = useState(false);

  const create = useMutation(
    trpc.stamp.create.mutationOptions({
      onSuccess: (row) => {
        toast.success("estampa criada");
        qc.invalidateQueries({ queryKey: trpc.stamp.adminAll.queryKey() });
        if (row?.id) router.push(`/admin/estampas/${row.id}`);
      },
      onError: (err) => toast.error(err.message),
    }),
  );
  const update = useMutation(
    trpc.stamp.update.mutationOptions({
      onSuccess: () => {
        toast.success("salvo");
        qc.invalidateQueries({ queryKey: trpc.stamp.adminAll.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "stamp");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({ error: "falha" }))) as {
          error?: string;
        };
        throw new Error(error ?? "falha no upload");
      }
      const { url } = (await res.json()) as { url: string };
      setImageUrl(url);
      toast.success("imagem enviada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "falha no upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug,
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      priceCents: price ? Math.round(Number(price) * 100) : null,
      quantity: Number(quantity) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 0,
      hidden,
    };
    if (initial) update.mutate({ id: initial.id, patch: payload });
    else create.mutate(payload);
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-2xl bg-card p-6 ring-1 ring-border/40"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="ex.: rosa-floral"
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
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>imagem</Label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {imageUrl && (
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
              <Image src={imageUrl} alt="" fill sizes="96px" className="object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary hover:file:bg-primary/20 disabled:opacity-60"
            />
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="ou cole uma URL https://..."
            />
            {uploading && <p className="text-xs text-muted-foreground">enviando…</p>}
          </div>
        </div>
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
          oculta
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {initial ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
