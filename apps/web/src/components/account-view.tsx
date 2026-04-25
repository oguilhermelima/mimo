"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
} from "@tanstack/react-query";
import {
  LogOut,
  MapPin,
  Package,
  Plus,
  Star,
  Trash2,
  User as UserIcon,
} from "lucide-react";

import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";
import { toast } from "@caixa/ui/toast";

import { authClient } from "~/lib/auth-client";
import { formatBRL } from "~/lib/format";
import { useCepAutofill } from "~/lib/use-cep-autofill";
import { useTRPC } from "~/trpc/react";

const TABS = [
  { key: "dados", label: "Dados", icon: UserIcon },
  { key: "enderecos", label: "Endereços", icon: MapPin },
  { key: "pedidos", label: "Pedidos", icon: Package },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_LABEL: Record<string, string> = {
  reservado: "Reservado",
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const STATUS_TONE: Record<string, string> = {
  reservado: "bg-amber-100 text-amber-900 ring-amber-300/50",
  aguardando_pagamento: "bg-amber-100 text-amber-900 ring-amber-300/50",
  pago: "bg-emerald-100 text-emerald-900 ring-emerald-300/50",
  entregue: "bg-emerald-100 text-emerald-900 ring-emerald-300/50",
  cancelado: "bg-muted text-muted-foreground ring-border/60",
};

export function AccountView() {
  const router = useRouter();
  const search = useSearchParams();
  const initialTab = (search.get("tab") as TabKey) ?? "dados";
  const [tab, setTab] = useState<TabKey>(
    TABS.some((t) => t.key === initialTab) ? initialTab : "dados",
  );

  const setTabUrl = (k: TabKey) => {
    setTab(k);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", k);
    router.replace(url.pathname + url.search);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div>
          <h1 className="font-serif text-4xl text-primary md:text-5xl">
            Sua conta
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            seus dados, endereços e pedidos.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-1.5 size-3.5" />
          Sair
        </Button>
      </header>

      <nav className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTabUrl(key)}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground"
                  : "inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground ring-1 ring-border/60 transition hover:bg-primary/10 hover:text-primary"
              }
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          );
        })}
      </nav>

      {tab === "dados" && <ProfileTab />}
      {tab === "enderecos" && <AddressesTab />}
      {tab === "pedidos" && <OrdersTab />}
    </div>
  );
}

function ProfileTab() {
  const trpc = useTRPC();
  const qc = useQueryClient();

  const [{ data: me }] = useSuspenseQueries({
    queries: [trpc.user.me.queryOptions()],
  });

  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone ?? "");
  const [cpf, setCpf] = useState(me.cpf ?? "");

  const update = useMutation(
    trpc.user.updateProfile.mutationOptions({
      onSuccess: async () => {
        toast.success("perfil atualizado");
        await qc.invalidateQueries({ queryKey: trpc.user.me.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      name: name.trim(),
      phone: phone.replace(/\D+/g, ""),
      cpf: cpf.replace(/\D+/g, ""),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-xl space-y-5 rounded-2xl border border-border/40 bg-card/30 p-6"
    >
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={me.email} readOnly disabled />
        <p className="text-xs text-muted-foreground">
          Pra mudar email, fale com a gente.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone (DDD + número)</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            placeholder="11999999999"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            inputMode="numeric"
            placeholder="00000000000"
            maxLength={14}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="rounded-full"
        disabled={update.isPending}
      >
        {update.isPending ? "salvando…" : "Salvar alterações"}
      </Button>
    </form>
  );
}

function AddressesTab() {
  const trpc = useTRPC();
  const qc = useQueryClient();

  const [{ data: addresses }] = useSuspenseQueries({
    queries: [trpc.user.listAddresses.queryOptions()],
  });

  const [editing, setEditing] = useState<string | "new" | null>(null);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: trpc.user.listAddresses.queryKey() });

  const add = useMutation(
    trpc.user.addAddress.mutationOptions({
      onSuccess: async () => {
        toast.success("endereço salvo");
        setEditing(null);
        await invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const update = useMutation(
    trpc.user.updateAddress.mutationOptions({
      onSuccess: async () => {
        toast.success("endereço atualizado");
        setEditing(null);
        await invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const remove = useMutation(
    trpc.user.deleteAddress.mutationOptions({
      onSuccess: async () => {
        toast.success("endereço removido");
        await invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const setDefault = useMutation(
    trpc.user.setDefaultAddress.mutationOptions({
      onSuccess: async () => {
        toast.success("endereço padrão atualizado");
        await invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  return (
    <div className="space-y-4">
      {addresses.length === 0 && editing !== "new" && (
        <p className="text-sm text-muted-foreground">
          Você ainda não cadastrou endereços. Adicione um quando quiser receber
          uma caixinha.
        </p>
      )}

      <ul className="space-y-3">
        {addresses.map((addr) =>
          editing === addr.id ? (
            <li key={addr.id}>
              <AddressForm
                initial={addr}
                pending={update.isPending}
                onCancel={() => setEditing(null)}
                onSubmit={(data) =>
                  update.mutate({
                    id: addr.id,
                    patch: data,
                  })
                }
              />
            </li>
          ) : (
            <li
              key={addr.id}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/30 p-4"
            >
              <div className="flex-1 text-sm">
                <p className="font-medium text-foreground">
                  {addr.label ?? addr.recipientName}
                  {addr.isDefault && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      <Star className="size-2.5" /> padrão
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {addr.street}, {addr.number}
                  {addr.complement ? ` — ${addr.complement}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {addr.district} · {addr.city}/{addr.state} ·{" "}
                  {formatCep(addr.postalCode)}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {!addr.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-xs"
                    onClick={() => setDefault.mutate({ id: addr.id })}
                  >
                    Tornar padrão
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-xs"
                  onClick={() => setEditing(addr.id)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-xs text-destructive"
                  onClick={() => {
                    if (confirm("Remover este endereço?"))
                      remove.mutate({ id: addr.id });
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <AddressForm
          pending={add.isPending}
          onCancel={() => setEditing(null)}
          onSubmit={(data) =>
            add.mutate({
              ...data,
              isDefault: data.isDefault ?? addresses.length === 0,
            })
          }
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setEditing("new")}
        >
          <Plus className="mr-2 size-4" />
          Adicionar endereço
        </Button>
      )}
    </div>
  );
}

interface AddressFormData {
  label?: string | null;
  recipientName: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  isDefault?: boolean;
}

function AddressForm({
  initial,
  pending,
  onCancel,
  onSubmit,
}: {
  initial?: Partial<AddressFormData>;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (data: AddressFormData) => void;
}) {
  const [data, setData] = useState<AddressFormData>({
    label: initial?.label ?? "",
    recipientName: initial?.recipientName ?? "",
    postalCode: initial?.postalCode ?? "",
    street: initial?.street ?? "",
    number: initial?.number ?? "",
    complement: initial?.complement ?? "",
    district: initial?.district ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "SP",
    isDefault: initial?.isDefault ?? false,
  });

  const set = (k: keyof AddressFormData, v: string | boolean) =>
    setData((d) => ({ ...d, [k]: v }));

  const cep = useCepAutofill(data.postalCode, (addr) =>
    setData((d) => ({
      ...d,
      street: d.street || addr.street,
      district: d.district || addr.district,
      city: d.city || addr.city,
      state: d.state || addr.state,
      complement: d.complement || addr.complement || "",
    })),
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      label: data.label || null,
      recipientName: data.recipientName.trim(),
      postalCode: data.postalCode.replace(/\D+/g, ""),
      street: data.street.trim(),
      number: data.number.trim(),
      complement: data.complement || null,
      district: data.district.trim(),
      city: data.city.trim(),
      state: data.state.toUpperCase(),
      isDefault: !!data.isDefault,
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-7 rounded-2xl border border-border/60 bg-card/50 p-5 md:p-6"
    >
      <FormSubsection title="Quem recebe">
        <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
          <Field label="Nome completo">
            <Input
              value={data.recipientName}
              onChange={(e) => set("recipientName", e.target.value)}
              required
              maxLength={200}
              placeholder="Como aparece no envelope"
            />
          </Field>
          <Field label="Apelido (opcional)">
            <Input
              value={data.label ?? ""}
              onChange={(e) => set("label", e.target.value)}
              maxLength={60}
              placeholder="ex.: casa, trabalho"
            />
          </Field>
        </div>
      </FormSubsection>

      <FormSubsection title="Endereço">
        <Field
          label="CEP"
          hint={
            cep.pending
              ? "buscando…"
              : cep.error
                ? cep.error
                : "preenchemos o restante automaticamente"
          }
          hintTone={cep.error ? "error" : "muted"}
        >
          <Input
            value={data.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
            placeholder="00000-000"
            required
            inputMode="numeric"
            maxLength={9}
            className="max-w-[220px]"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Rua / Avenida">
            <Input
              value={data.street}
              onChange={(e) => set("street", e.target.value)}
              required
              maxLength={200}
            />
          </Field>
          <Field label="Número">
            <Input
              value={data.number}
              onChange={(e) => set("number", e.target.value)}
              required
              maxLength={20}
            />
          </Field>
        </div>

        <Field label="Complemento (opcional)">
          <Input
            value={data.complement ?? ""}
            onChange={(e) => set("complement", e.target.value)}
            maxLength={120}
            placeholder="ap, bloco, ponto de referência…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_90px]">
          <Field label="Bairro">
            <Input
              value={data.district}
              onChange={(e) => set("district", e.target.value)}
              required
              maxLength={120}
            />
          </Field>
          <Field label="Cidade">
            <Input
              value={data.city}
              onChange={(e) => set("city", e.target.value)}
              required
              maxLength={120}
            />
          </Field>
          <Field label="UF">
            <Input
              value={data.state}
              onChange={(e) => set("state", e.target.value)}
              required
              maxLength={2}
              className="uppercase"
            />
          </Field>
        </div>
      </FormSubsection>

      <label className="flex items-center gap-2 border-t border-border/40 pt-4 text-sm">
        <input
          type="checkbox"
          checked={!!data.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="size-4 rounded border-border accent-primary"
        />
        Usar como endereço padrão
      </label>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={onCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending ? "salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

function OrdersTab() {
  const trpc = useTRPC();
  const [{ data: orders }] = useSuspenseQueries({
    queries: [trpc.order.myOrders.queryOptions()],
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
        <Package className="mx-auto mb-3 size-8 text-primary/40" />
        <p className="font-serif text-xl text-foreground">Sem pedidos por aqui</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Quando você fizer uma compra, ela aparece aqui pra acompanhar.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => {
        const itemsCount = o.items.reduce((n, i) => n + i.quantity, 0);
        return (
          <li key={o.id}>
            <Link
              href={`/conta/pedidos/${o.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/30 p-4 transition hover:border-primary/40"
            >
              <div className="flex-1">
                <p className="font-mono text-xs text-muted-foreground">
                  #{o.id.slice(0, 8)}
                </p>
                <p className="mt-0.5 font-serif text-base">
                  {itemsCount} {itemsCount === 1 ? "item" : "itens"} ·{" "}
                  {formatBRL(o.totalCents)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1 ${
                  STATUS_TONE[o.status] ?? STATUS_TONE.cancelado
                }`}
              >
                {STATUS_LABEL[o.status] ?? o.status}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Field({
  label,
  hint,
  hintTone = "muted",
  children,
}: {
  label: string;
  hint?: string;
  hintTone?: "muted" | "error";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </Label>
        {hint && (
          <span
            className={`text-[10px] ${
              hintTone === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function FormSubsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function formatCep(raw: string) {
  const cep = raw.padStart(8, "0");
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}
