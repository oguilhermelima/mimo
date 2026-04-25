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
import { digits, maskCpf, maskPhoneBr } from "~/lib/format-input";
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

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div className="space-y-8">
      <header className="border-border/40 border-b pb-6">
        <h1 className="text-primary font-serif text-4xl md:text-5xl">
          Sua conta
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          seus dados, endereços e pedidos.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTabUrl(key)}
                  className={
                    active
                      ? "bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm lg:w-full lg:justify-start lg:rounded-xl lg:px-3"
                      : "bg-muted/60 text-muted-foreground ring-border/60 hover:bg-primary/10 hover:text-primary lg:hover:bg-muted/60 inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 transition lg:w-full lg:justify-start lg:rounded-xl lg:bg-transparent lg:px-3 lg:ring-0"
                  }
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="border-border/40 mt-6 hidden border-t pt-4 lg:block">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive w-full justify-start rounded-xl px-3"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              Sair
            </Button>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <h2 className="text-foreground font-serif text-2xl">
              {activeTab.label}
            </h2>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1.5 size-3.5" />
              Sair
            </Button>
          </div>

          {tab === "dados" && <ProfileTab />}
          {tab === "enderecos" && <AddressesTab />}
          {tab === "pedidos" && <OrdersTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="max-w-2xl space-y-5">
      <ProfileForm />
      <EmailForm />
      <PasswordForm />
    </div>
  );
}

function ProfileForm() {
  const trpc = useTRPC();
  const qc = useQueryClient();

  const [{ data: me }] = useSuspenseQueries({
    queries: [trpc.user.me.queryOptions()],
  });

  const cpfLocked = !!me.cpf;
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(maskPhoneBr(me.phone ?? ""));
  const [cpf, setCpf] = useState(maskCpf(me.cpf ?? ""));

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
      phone: digits(phone),
      ...(cpfLocked ? {} : { cpf: digits(cpf) }),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="border-border/40 bg-card/30 space-y-5 rounded-2xl border p-6"
    >
      <div>
        <h3 className="font-serif text-lg">Dados pessoais</h3>
        <p className="text-muted-foreground text-xs">
          Nome, telefone e CPF que aparecem nos pedidos.
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
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(maskPhoneBr(e.target.value))}
            inputMode="numeric"
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            inputMode="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
            disabled={cpfLocked}
            readOnly={cpfLocked}
          />
          {cpfLocked && (
            <p className="text-muted-foreground text-xs">
              CPF não pode ser alterado depois de cadastrado.
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? "salvando…" : "Salvar alterações"}
      </Button>
    </form>
  );
}

function EmailForm() {
  const trpc = useTRPC();
  const [{ data: me }] = useSuspenseQueries({
    queries: [trpc.user.me.queryOptions()],
  });

  const [email, setEmail] = useState(me.email);
  const [pending, setPending] = useState(false);

  const dirty = email.trim().toLowerCase() !== me.email.toLowerCase();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setPending(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail: email.trim(),
        callbackURL: "/conta?tab=dados",
      });
      if (error) {
        toast.error(error.message ?? "não foi possível trocar o email");
      } else {
        toast.success(
          `enviamos um link para ${me.email} pra confirmar a troca`,
        );
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border-border/40 bg-card/30 space-y-4 rounded-2xl border p-6"
    >
      <div>
        <h3 className="font-serif text-lg">Email</h3>
        <p className="text-muted-foreground text-xs">
          Trocar o email envia um link de confirmação para o endereço atual.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={200}
          autoComplete="email"
        />
      </div>

      <Button type="submit" variant="outline" disabled={!dirty || pending}>
        {pending ? "enviando…" : "Trocar email"}
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("nova senha precisa de pelo menos 8 caracteres");
      return;
    }
    if (next !== confirm) {
      toast.error("a confirmação não bate com a nova senha");
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message ?? "não foi possível trocar a senha");
      } else {
        toast.success("senha atualizada");
        reset();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border-border/40 bg-card/30 space-y-4 rounded-2xl border p-6"
    >
      <div>
        <h3 className="font-serif text-lg">Senha</h3>
        <p className="text-muted-foreground text-xs">
          Trocar a senha encerra sessões em outros dispositivos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="current-password">Senha atual</Label>
        <Input
          id="current-password"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input
            id="new-password"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar nova senha</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="outline"
        disabled={pending || !current || !next || !confirm}
      >
        {pending ? "salvando…" : "Trocar senha"}
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
        <p className="text-muted-foreground text-sm">
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
              className="border-border/60 bg-card/30 flex items-start gap-3 rounded-2xl border p-4"
            >
              <div className="flex-1 text-sm">
                <p className="text-foreground font-medium">
                  {addr.label ?? addr.recipientName}
                  {addr.isDefault && (
                    <span className="bg-primary/15 text-primary ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      <Star className="size-2.5" /> padrão
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground mt-0.5">
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
                    className="text-xs"
                    onClick={() => setDefault.mutate({ id: addr.id })}
                  >
                    Tornar padrão
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setEditing(addr.id)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive text-xs"
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
      className="border-border/60 bg-card/50 space-y-7 rounded-2xl border p-5 md:p-6"
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

      <label className="border-border/40 flex items-center gap-2 border-t pt-4 text-sm">
        <input
          type="checkbox"
          checked={!!data.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="border-border accent-primary size-4 rounded"
        />
        Usar como endereço padrão
      </label>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
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
      <div className="border-border/60 rounded-2xl border border-dashed p-10 text-center">
        <Package className="text-primary/40 mx-auto mb-3 size-8" />
        <p className="text-foreground font-serif text-xl">
          Sem pedidos por aqui
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
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
              className="border-border/60 bg-card/30 hover:border-primary/40 flex items-center justify-between gap-3 rounded-2xl border p-4 transition"
            >
              <div className="flex-1">
                <p className="text-muted-foreground font-mono text-xs">
                  #{o.id.slice(0, 8)}
                </p>
                <p className="mt-0.5 font-serif text-base">
                  {itemsCount} {itemsCount === 1 ? "item" : "itens"} ·{" "}
                  {formatBRL(o.totalCents)}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {new Date(o.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase ring-1 ${
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
        <Label className="text-muted-foreground text-[10px] font-semibold tracking-[0.22em] uppercase">
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
      <h3 className="text-primary/80 text-[10px] font-semibold tracking-[0.28em] uppercase">
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
