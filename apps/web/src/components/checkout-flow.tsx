"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  Home,
  MapPin,
  Sparkles,
  Truck,
} from "lucide-react";

import { PAYMENT_METHODS, type PaymentMethod } from "@caixa/db/schema";
import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";
import { toast } from "@caixa/ui/toast";

import { totalCents, useCart, type CartEntry } from "~/lib/cart-store";
import { formatBRL, paymentLabel } from "~/lib/format";
import { useCepAutofill } from "~/lib/use-cep-autofill";
import { useTRPC } from "~/trpc/react";

type Fulfillment = "delivery" | "pickup_taboao";

const STORE_PICKUP_CITY = "Taboão da Serra — SP";

export function CheckoutFlow() {
  const router = useRouter();
  const search = useSearchParams();
  const trpc = useTRPC();
  const qc = useQueryClient();

  const entries = useCart((s) => s.entries);
  const clearCart = useCart((s) => s.clear);
  const grand = totalCents(entries);

  const me = useSuspenseQuery(trpc.user.me.queryOptions());
  const addresses = useSuspenseQuery(trpc.user.listAddresses.queryOptions());

  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup_taboao");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addresses.data.find((a) => a.isDefault)?.id ?? addresses.data[0]?.id ?? null,
  );
  const [showNewAddress, setShowNewAddress] = useState(
    addresses.data.length === 0,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [customerNote, setCustomerNote] = useState("");

  const couponCode = search.get("coupon")?.toUpperCase() ?? "";

  useEffect(() => {
    if (entries.length === 0) {
      router.replace("/carrinho");
    }
  }, [entries.length, router]);

  const profileIncomplete = !me.data.cpf || !me.data.phone;

  const addAddress = useMutation(
    trpc.user.addAddress.mutationOptions({
      onSuccess: async (created) => {
        toast.success("endereço salvo");
        await qc.invalidateQueries({
          queryKey: trpc.user.listAddresses.queryKey(),
        });
        setSelectedAddressId(created.id);
        setShowNewAddress(false);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const createOrder = useMutation(
    trpc.order.create.mutationOptions({
      onSuccess: async (order) => {
        clearCart();
        await qc.invalidateQueries({
          queryKey: trpc.order.myOrders.queryKey(),
        });
        toast.success("pedido reservado!");
        router.replace(`/conta/pedidos/${order.id}`);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSubmit = () => {
    if (entries.some((e) => e.priceCents == null)) {
      toast.error(
        "Há item sob consulta no carrinho. Entre em contato pelo WhatsApp para concluir o pedido.",
      );
      return;
    }

    if (fulfillment === "delivery" && !selectedAddressId) {
      toast.error("escolha um endereço de entrega");
      return;
    }

    const items = entries.map(cartEntryToCheckoutItem).filter(Boolean);
    if (items.length === 0) {
      toast.error("carrinho vazio");
      return;
    }

    createOrder.mutate({
      items: items as Parameters<typeof createOrder.mutate>[0]["items"],
      fulfillmentMethod: fulfillment,
      addressId: fulfillment === "delivery" ? selectedAddressId : null,
      paymentMethod,
      customerNote: customerNote.trim() || undefined,
      couponCode: couponCode || undefined,
    });
  };

  if (entries.length === 0) return null;

  const canSubmit =
    !profileIncomplete &&
    !createOrder.isPending &&
    grand != null &&
    (fulfillment === "pickup_taboao" || !!selectedAddressId);

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-8">
        <header>
          <h1 className="font-serif text-4xl text-primary md:text-5xl">
            Finalizar compra
          </h1>
          <p className="mt-2 text-muted-foreground md:text-lg">
            Ao concluir o pedido, reservamos os itens por 12 horas. Em seguida,
            entramos em contato pelo WhatsApp para confirmar o pagamento e a
            entrega.
          </p>
        </header>

        {profileIncomplete && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50/70 p-4 text-amber-900">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                Complete seu perfil antes de finalizar o pedido
              </p>
              <p>
                Precisamos do seu nome, CPF e telefone para emitir a reserva.{" "}
                <Link href="/conta" className="font-medium underline">
                  Atualizar perfil
                </Link>
              </p>
            </div>
          </div>
        )}

        <Section
          number={1}
          title="Recebimento"
          description="Selecione como você quer receber o pedido."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <FulfillmentCard
              icon={<Truck className="size-5" />}
              title="Entrega no endereço"
              description="Confirmamos prazo e valor do frete pelo WhatsApp após a reserva."
              checked={fulfillment === "delivery"}
              onClick={() => setFulfillment("delivery")}
            />
            <FulfillmentCard
              icon={<Home className="size-5" />}
              title="Retirada em Taboão"
              description="Combinamos local e horário pelo WhatsApp após a reserva."
              checked={fulfillment === "pickup_taboao"}
              onClick={() => setFulfillment("pickup_taboao")}
            />
          </div>
        </Section>

        {fulfillment === "delivery" ? (
          <Section
            number={2}
            title="Endereço de entrega"
            description="Para onde devemos enviar o pedido."
          >
            {addresses.data.length > 0 && (
              <ul className="space-y-2">
                {addresses.data.map((addr) => {
                  const checked = selectedAddressId === addr.id;
                  return (
                    <li key={addr.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setShowNewAddress(false);
                        }}
                        className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          checked
                            ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                            : "border-border/60 hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {checked && <Check className="size-3" />}
                        </span>
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-foreground">
                            {addr.label ?? addr.recipientName}
                            {addr.isDefault && (
                              <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                                padrão
                              </span>
                            )}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.street}, {addr.number}
                            {addr.complement ? ` — ${addr.complement}` : ""}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.district} · {addr.city}/{addr.state} ·{" "}
                            {formatCep(addr.postalCode)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {showNewAddress ? (
              <NewAddressForm
                pending={addAddress.isPending}
                onCancel={
                  addresses.data.length > 0
                    ? () => setShowNewAddress(false)
                    : undefined
                }
                onSubmit={(data) =>
                  addAddress.mutate({
                    ...data,
                    isDefault: addresses.data.length === 0,
                  })
                }
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowNewAddress(true)}
              >
                <MapPin className="mr-2 size-4" />
                Adicionar novo endereço
              </Button>
            )}
          </Section>
        ) : (
          <Section
            number={2}
            title="Local de retirada"
            description="Endereço completo combinado pelo WhatsApp após a reserva."
          >
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-serif text-lg text-primary">
                {STORE_PICKUP_CITY}
              </p>
              <p className="mt-1 text-muted-foreground">
                Ao confirmar a reserva, entramos em contato pelo WhatsApp para
                combinar o local exato e o horário da retirada.
              </p>
            </div>
          </Section>
        )}

        <Section
          number={3}
          title="Pagamento"
          description="A confirmação do pagamento é feita pelo WhatsApp após a reserva."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPaymentMethod(m)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  paymentMethod === m
                    ? "border-primary bg-primary/5 ring-2 ring-primary/40"
                    : "border-border/60 hover:border-primary/40"
                }`}
              >
                <span className="text-sm font-medium">{paymentLabel(m)}</span>
                {paymentMethod === m && (
                  <Check className="size-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </Section>

        <Section
          number={4}
          title="Observações"
          description="Detalhes da personalização: cores, mensagem do bilhete, preferências (opcional)."
        >
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full resize-none rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm transition focus:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            placeholder="Bilhete, cor da fita, mensagem especial…"
          />
        </Section>
      </div>

      <aside className="h-fit space-y-5 rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-6 ring-1 ring-border/40 lg:sticky lg:top-24">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-foreground">
            <Sparkles className="size-4 text-primary" />
            Resumo
          </h2>
          <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {entries.length} {entries.length === 1 ? "item" : "itens"}
          </span>
        </div>

        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.lineId} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/40">
                {e.imageUrl ? (
                  <Image
                    src={e.imageUrl}
                    alt={e.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg text-primary/40">
                    ✦
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium leading-tight">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {e.quantity}× ·{" "}
                  {formatBRL(
                    e.priceCents != null ? e.priceCents * e.quantity : null,
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="space-y-1 border-t border-border/40 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatBRL(grand)}</dd>
          </div>
          {couponCode && (
            <div className="flex justify-between text-emerald-700">
              <dt>Cupom {couponCode}</dt>
              <dd>validado na confirmação</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-border/40 pt-2">
            <dt className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Total estimado
            </dt>
            <dd className="font-serif text-2xl text-primary tabular-nums">
              {formatBRL(grand)}
            </dd>
          </div>
        </dl>

        <Button
          size="lg"
          className="w-full rounded-full"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {createOrder.isPending ? "reservando…" : "Reservar pedido"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          A reserva fica válida por 12 horas. Sem confirmação dentro desse
          prazo, os itens retornam ao estoque automaticamente.
        </p>
      </aside>
    </div>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {number}
        </span>
        <div>
          <h2 className="font-serif text-2xl text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      <div className="pl-11">{children}</div>
    </section>
  );
}

function FulfillmentCard({
  icon,
  title,
  description,
  checked,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-primary bg-primary/5 ring-2 ring-primary/40"
          : "border-border/60 hover:border-primary/40"
      }`}
    >
      <span
        className={`flex size-10 items-center justify-center rounded-full ${
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground/70"
        }`}
      >
        {icon}
      </span>
      <span className="font-serif text-lg">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

interface NewAddressInput {
  label?: string | null;
  recipientName: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
}

function NewAddressForm({
  pending,
  onCancel,
  onSubmit,
}: {
  pending: boolean;
  onCancel?: () => void;
  onSubmit: (data: NewAddressInput) => void;
}) {
  const [data, setData] = useState<NewAddressInput>({
    label: "",
    recipientName: "",
    postalCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "SP",
  });

  const set = (k: keyof NewAddressInput, v: string) =>
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

      <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" className="rounded-full" disabled={pending}>
          {pending ? "salvando…" : "Salvar endereço"}
        </Button>
      </div>
    </form>
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

function formatCep(raw: string) {
  const cep = raw.padStart(8, "0");
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

function cartEntryToCheckoutItem(e: CartEntry) {
  if (e.kind === "product") {
    return {
      kind: "product" as const,
      productId: e.itemId,
      quantity: e.quantity,
    };
  }
  if (e.kind === "bundle") {
    return {
      kind: "bundle" as const,
      bundleId: e.itemId,
      quantity: e.quantity,
    };
  }
  if (e.kind === "custom_box" && e.customBox) {
    return {
      kind: "custom_box" as const,
      customBox: e.customBox,
      quantity: e.quantity,
    };
  }
  return null;
}
