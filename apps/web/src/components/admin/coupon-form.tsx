"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
} from "@tanstack/react-query";
import { toast } from "@caixa/ui/toast";

import {
  COUPON_DISCOUNT_TYPES,
  COUPON_SCOPES,
  PRODUCT_TYPES,
  type CouponDiscountType,
  type CouponScope,
  type ProductType,
} from "@caixa/db/schema";
import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";

import { productTypeLabel } from "~/lib/format";
import { useTRPC } from "~/trpc/react";

interface Initial {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  scope: CouponScope;
  targetProductId: string | null;
  targetBundleId: string | null;
  targetProductType: ProductType | null;
  validFrom: Date | null;
  validTo: Date | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
}

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function CouponForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const trpc = useTRPC();
  const qc = useQueryClient();

  const [products, bundles] = useSuspenseQueries({
    queries: [
      trpc.product.adminAll.queryOptions(),
      trpc.bundle.adminAll.queryOptions(),
    ],
  });

  const [code, setCode] = useState(initial?.code ?? "");
  const [discountType, setDiscountType] = useState<CouponDiscountType>(
    initial?.discountType ?? "percent",
  );
  const [discountValue, setDiscountValue] = useState<string>(
    initial?.discountValue?.toString() ?? "10",
  );
  const [scope, setScope] = useState<CouponScope>(initial?.scope ?? "global");
  const [targetProductId, setTargetProductId] = useState(
    initial?.targetProductId ?? "",
  );
  const [targetBundleId, setTargetBundleId] = useState(
    initial?.targetBundleId ?? "",
  );
  const [targetProductType, setTargetProductType] = useState<ProductType | "">(
    initial?.targetProductType ?? "",
  );
  const [validFrom, setValidFrom] = useState(toDateInput(initial?.validFrom ?? null));
  const [validTo, setValidTo] = useState(toDateInput(initial?.validTo ?? null));
  const [maxUses, setMaxUses] = useState<string>(
    initial?.maxUses?.toString() ?? "",
  );
  const [active, setActive] = useState(initial?.active ?? true);

  const create = useMutation(
    trpc.coupon.create.mutationOptions({
      onSuccess: (row) => {
        toast.success("cupom criado");
        qc.invalidateQueries({ queryKey: trpc.coupon.adminAll.queryKey() });
        if (row?.id) router.push(`/admin/cupons/${row.id}`);
      },
      onError: (err) => toast.error(err.message),
    }),
  );
  const update = useMutation(
    trpc.coupon.update.mutationOptions({
      onSuccess: () => {
        toast.success("salvo");
        qc.invalidateQueries({ queryKey: trpc.coupon.adminAll.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue) || 0,
      scope,
      targetProductId: scope === "product" ? targetProductId || null : null,
      targetBundleId: scope === "bundle" ? targetBundleId || null : null,
      targetProductType:
        scope === "product_type"
          ? (targetProductType as ProductType) || null
          : null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      active,
    };
    if (initial) update.mutate({ id: initial.id, patch: payload });
    else create.mutate(payload);
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-2xl bg-card p-6 ring-1 ring-border/40"
    >
      <div className="grid gap-4 md:grid-cols-[240px_1fr_180px]">
        <div className="space-y-2">
          <Label>código</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="MAE10"
            pattern="[A-Z0-9_-]+"
            required
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <Label>tipo de desconto</Label>
          <select
            value={discountType}
            onChange={(e) =>
              setDiscountType(e.target.value as CouponDiscountType)
            }
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {COUPON_DISCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "percent" ? "Percentual (%)" : "Fixo (centavos)"}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>valor</Label>
          <Input
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            inputMode="numeric"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>escopo</Label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as CouponScope)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {COUPON_SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {scope === "product" && (
          <div className="space-y-2">
            <Label>produto</Label>
            <select
              value={targetProductId}
              onChange={(e) => setTargetProductId(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              required
            >
              <option value="">— selecione —</option>
              {products.data.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {scope === "bundle" && (
          <div className="space-y-2">
            <Label>caixa</Label>
            <select
              value={targetBundleId}
              onChange={(e) => setTargetBundleId(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              required
            >
              <option value="">— selecione —</option>
              {bundles.data
                .filter((b) => b.source === "catalog")
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
            </select>
          </div>
        )}

        {scope === "product_type" && (
          <div className="space-y-2">
            <Label>tipo de produto</Label>
            <select
              value={targetProductType}
              onChange={(e) =>
                setTargetProductType(e.target.value as ProductType | "")
              }
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              required
            >
              <option value="">— selecione —</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {productTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>válido a partir de</Label>
          <Input
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>válido até</Label>
          <Input
            type="date"
            value={validTo}
            onChange={(e) => setValidTo(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>usos máximos (vazio = ilimitado)</Label>
          <Input
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            inputMode="numeric"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="size-4 accent-primary"
        />
        ativo
      </label>

      {initial && (
        <p className="text-xs text-muted-foreground">
          usos registrados: {initial.usedCount}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {initial ? "Salvar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}
