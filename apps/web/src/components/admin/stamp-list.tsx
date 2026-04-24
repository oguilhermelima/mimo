"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "@caixa/ui/toast";

import { Button } from "@caixa/ui/button";

import { formatBRL } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { LogoMonogram } from "~/components/logo";
import { AdminNav } from "./admin-nav";

export function StampList() {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.stamp.adminAll.queryOptions());

  const toggleHidden = useMutation(
    trpc.stamp.toggleHidden.mutationOptions({
      onSuccess: () =>
        qc.invalidateQueries({
          queryKey: trpc.stamp.adminAll.queryKey(),
        }),
    }),
  );
  const del = useMutation(
    trpc.stamp.delete.mutationOptions({
      onSuccess: () => {
        toast.success("estampa removida");
        qc.invalidateQueries({ queryKey: trpc.stamp.adminAll.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <LogoMonogram className="hidden h-7 w-auto text-primary/60 md:block" />
            <div>
              <h1 className="font-serif text-3xl text-primary">Estampas</h1>
              <p className="text-sm text-muted-foreground">
                estampas aplicadas nas caixinhas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/estampas/nova">Nova estampa</Link>
            </Button>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
        <AdminNav />
      </header>

      <div className="rounded-2xl bg-card ring-1 ring-border/40">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left font-serif text-foreground/80">
            <tr>
              <th className="px-4 py-3">Estampa</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((s) => {
              const low = s.quantity > 0 && s.quantity <= s.lowStockThreshold;
              const out = s.quantity <= 0;
              return (
                <tr key={s.id} className="border-t border-border/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.imageUrl && (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={s.imageUrl}
                            alt={s.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/admin/estampas/${s.id}`}
                          className="text-primary hover:underline"
                        >
                          {s.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">/{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatBRL(s.priceCents)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        out
                          ? "text-destructive"
                          : low
                            ? "text-primary"
                            : "text-muted-foreground"
                      }
                    >
                      {s.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleHidden.mutate({ id: s.id, hidden: !s.hidden })
                      }
                      className={`rounded-full px-3 py-1 text-xs ${s.hidden ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                    >
                      {s.hidden ? "Oculta" : "Pública"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`excluir "${s.name}"?`))
                          del.mutate({ id: s.id });
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
