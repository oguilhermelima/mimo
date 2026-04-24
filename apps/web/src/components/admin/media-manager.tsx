"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@caixa/ui/toast";

import { MEDIA_KINDS, type MediaKind } from "@caixa/db/schema";
import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";

import { useTRPC } from "~/trpc/react";

interface MediaRow {
  id: string;
  kind: MediaKind;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export function MediaManager({
  productId,
  media,
}: {
  productId: string;
  media: MediaRow[];
}) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [kind, setKind] = useState<MediaKind>("image");

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: trpc.product.adminById.queryKey({ id: productId }),
    });

  const add = useMutation(
    trpc.product.addMedia.mutationOptions({
      onSuccess: () => {
        setUrl("");
        setAlt("");
        toast.success("mídia adicionada");
        invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
  const remove = useMutation(
    trpc.product.removeMedia.mutationOptions({
      onSuccess: invalidate,
    }),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    add.mutate({
      productId,
      kind,
      url,
      alt: alt || null,
      sortOrder: media.length,
    });
  };

  return (
    <div className="space-y-4 rounded-2xl bg-card p-6 ring-1 ring-border/40">
      <div>
        <h2 className="font-serif text-2xl text-primary">Mídia</h2>
        <p className="text-xs text-muted-foreground">
          todas as mídias ficam em <strong>formato Instagram (1:1)</strong> —
          envie quadradas para não cortar
        </p>
      </div>

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {media.map((m) => (
            <li key={m.id} className="relative overflow-hidden rounded-xl ring-1 ring-border">
              {m.kind === "image" ? (
                <div className="relative aspect-[4/5]">
                  <Image src={m.url} alt={m.alt ?? ""} fill sizes="160px" className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-muted text-sm text-muted-foreground">
                  vídeo
                </div>
              )}
              <button
                onClick={() => remove.mutate({ id: m.id })}
                className="absolute right-1 top-1 rounded-full bg-background/90 px-2 py-1 text-xs hover:text-destructive"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">nenhuma mídia ainda</p>
      )}

      <form onSubmit={submit} className="grid gap-3 md:grid-cols-[140px_1fr_1fr_auto]">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as MediaKind)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          {MEDIA_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <Input
          type="url"
          placeholder="url (https://…)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <Input
          placeholder="descrição (alt)"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
        <Button type="submit" disabled={add.isPending}>
          Adicionar
        </Button>
      </form>
    </div>
  );
}
