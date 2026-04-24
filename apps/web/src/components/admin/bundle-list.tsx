"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "@caixa/ui/toast";

import { Button } from "@caixa/ui/button";

import { authClient } from "~/lib/auth-client";
import { bundleSourceLabel, formatBRL } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { LogoMonogram } from "~/components/logo";
import { AdminNav } from "./admin-nav";

export function BundleList() {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.bundle.adminAll.queryOptions());

  const toggleHidden = useMutation(
    trpc.bundle.toggleHidden.mutationOptions({
      onSuccess: () =>
        qc.invalidateQueries({
          queryKey: trpc.bundle.adminAll.queryKey(),
        }),
    }),
  );
  const del = useMutation(
    trpc.bundle.delete.mutationOptions({
      onSuccess: () => {
        toast.success("caixa removida");
        qc.invalidateQueries({ queryKey: trpc.bundle.adminAll.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const logout = async () => {
    await authClient.signOut();
    router.replace("/entrar");
    router.refresh();
  };

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <LogoMonogram className="hidden h-7 w-auto text-primary/60 md:block" />
            <div>
              <h1 className="font-serif text-3xl text-primary">Caixas</h1>
              <p className="text-sm text-muted-foreground">
                caixas prontas (catálogo) e encomendas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/caixas/nova">Nova caixa</Link>
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
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((b) => {
              const low = b.quantity > 0 && b.quantity <= b.lowStockThreshold;
              const out = b.quantity <= 0;
              return (
                <tr key={b.id} className="border-t border-border/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/caixas/${b.id}`}
                      className="text-primary hover:underline"
                    >
                      {b.title}
                    </Link>
                    {b.slug && (
                      <p className="text-xs text-muted-foreground">/{b.slug}</p>
                    )}
                    {b.source === "user_order" && b.customerName && (
                      <p className="text-xs text-muted-foreground">
                        {b.customerName}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {bundleSourceLabel(b.source)}
                  </td>
                  <td className="px-4 py-3">{formatBRL(b.priceCents)}</td>
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
                      {b.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleHidden.mutate({ id: b.id, hidden: !b.hidden })
                      }
                      className={`rounded-full px-3 py-1 text-xs ${b.hidden ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                    >
                      {b.hidden ? "Oculta" : "Pública"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`excluir "${b.title}"?`))
                          del.mutate({ id: b.id });
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
