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
import { formatBRL, productTypeLabel } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { LogoMonogram } from "~/components/logo";
import { AdminNav } from "./admin-nav";

export function AdminProductList() {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.product.adminAll.queryOptions());

  const toggleHidden = useMutation(
    trpc.product.toggleHidden.mutationOptions({
      onSuccess: () =>
        qc.invalidateQueries({
          queryKey: trpc.product.adminAll.queryKey(),
        }),
    }),
  );
  const del = useMutation(
    trpc.product.delete.mutationOptions({
      onSuccess: () => {
        toast.success("produto removido");
        qc.invalidateQueries({ queryKey: trpc.product.adminAll.queryKey() });
      },
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
              <h1 className="font-serif text-3xl text-primary">Produtos</h1>
              <p className="text-sm text-muted-foreground">
                gerencie caixas, itens e disponibilidade
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/produtos/novo">Novo Produto</Link>
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
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((p) => {
              const low =
                p.quantity > 0 && p.quantity <= p.lowStockThreshold;
              const out = p.quantity <= 0;
              return (
                <tr key={p.id} className="border-t border-border/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="text-primary hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    {productTypeLabel(p.type)}
                  </td>
                  <td className="px-4 py-3">{formatBRL(p.priceCents)}</td>
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
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toggleHidden.mutate({ id: p.id, hidden: !p.hidden })
                      }
                      className={`rounded-full px-3 py-1 text-xs ${p.hidden ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
                    >
                      {p.hidden ? "Oculto" : "Público"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`excluir "${p.title}"?`))
                          del.mutate({ id: p.id });
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
