"use client";

import { useRef, useState } from "react";
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

export function BundleMediaManager({
  bundleId,
  media,
}: {
  bundleId: string;
  media: MediaRow[];
}) {
  const trpc = useTRPC();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [kind, setKind] = useState<MediaKind>("image");
  const [uploading, setUploading] = useState(false);

  const invalidate = () =>
    qc.invalidateQueries({
      queryKey: trpc.bundle.adminById.queryKey({ id: bundleId }),
    });

  const add = useMutation(
    trpc.bundle.addMedia.mutationOptions({
      onSuccess: () => {
        setUrl("");
        setAlt("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.success("mídia adicionada");
        invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );
  const remove = useMutation(
    trpc.bundle.removeMedia.mutationOptions({ onSuccess: invalidate }),
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "bundle");
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
      const { url: uploadedUrl } = (await res.json()) as { url: string };
      setUrl(uploadedUrl);
      toast.success("arquivo enviado — preencha descrição e adicione");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "falha no upload");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    add.mutate({
      bundleId,
      kind,
      url,
      alt: alt || null,
      sortOrder: media.length,
    });
  };

  return (
    <div className="space-y-4 rounded-2xl bg-card p-6 ring-1 ring-border/40">
      <div>
        <h2 className="font-serif text-2xl text-primary">Galeria da caixa</h2>
        <p className="text-xs text-muted-foreground">
          fotos próprias desta caixa — formato 4:5 (instagram) pra não cortar
        </p>
      </div>

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {media.map((m) => (
            <li
              key={m.id}
              className="relative overflow-hidden rounded-xl ring-1 ring-border"
            >
              {m.kind === "image" ? (
                <div className="relative aspect-[4/5]">
                  <Image
                    src={m.url}
                    alt={m.alt ?? ""}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
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

      <form onSubmit={submit} className="space-y-3">
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border/60 p-3 md:flex-row md:items-center md:gap-3">
          <label className="text-sm font-medium text-muted-foreground md:w-40">
            Enviar arquivo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary hover:file:bg-primary/20 disabled:opacity-60"
          />
          {uploading ? (
            <span className="text-xs text-muted-foreground">enviando…</span>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-[140px_1fr_1fr_auto]">
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
            placeholder="url (upload ou cole um link)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <Input
            placeholder="descrição (alt)"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
          />
          <Button type="submit" disabled={add.isPending || uploading}>
            Adicionar
          </Button>
        </div>
      </form>
    </div>
  );
}
