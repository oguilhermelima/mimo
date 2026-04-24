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

import { formatBRL } from "~/lib/format";
import { useTRPC } from "~/trpc/react";
import { LogoMonogram } from "~/components/logo";
import { AdminNav } from "./admin-nav";

const scopeLabel: Record<string, string> = {
  global: "Global",
  product: "Produto",
  bundle: "Caixa",
  product_type: "Tipo",
};

export function CouponList() {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(trpc.coupon.adminAll.queryOptions());

  const toggleActive = useMutation(
    trpc.coupon.toggleActive.mutationOptions({
      onSuccess: () =>
        qc.invalidateQueries({
          queryKey: trpc.coupon.adminAll.queryKey(),
        }),
    }),
  );
  const del = useMutation(
    trpc.coupon.delete.mutationOptions({
      onSuccess: () => {
        toast.success("cupom removido");
        qc.invalidateQueries({ queryKey: trpc.coupon.adminAll.queryKey() });
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
              <h1 className="font-serif text-3xl text-primary">Cupons</h1>
              <p className="text-sm text-muted-foreground">
                desconto global ou por produto/caixa/tipo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/cupons/novo">Novo cupom</Link>
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
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Escopo</th>
              <th className="px-4 py-3">Uso</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/cupons/${c.id}`}
                    className="font-mono text-primary hover:underline"
                  >
                    {c.code}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {c.discountType === "percent"
                    ? `${c.discountValue}%`
                    : formatBRL(c.discountValue)}
                </td>
                <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                  {scopeLabel[c.scope] ?? c.scope}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.usedCount}
                  {c.maxUses ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      toggleActive.mutate({ id: c.id, active: !c.active })
                    }
                    className={`rounded-full px-3 py-1 text-xs ${c.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                  >
                    {c.active ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`excluir ${c.code}?`))
                        del.mutate({ id: c.id });
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
