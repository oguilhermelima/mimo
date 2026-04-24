import type { CartEntry } from "./cart-store";
import { formatBRL, paymentLabel } from "./format";

interface BuildOpts {
  entries: CartEntry[];
  paymentMethod?: string;
  notes?: string;
  couponCode?: string;
  storeName: string;
  phone: string;
}

export function buildWhatsAppUrl(opts: BuildOpts): string {
  const lines: string[] = [];
  lines.push(`Olá! Quero encomendar na *${opts.storeName}*.`);
  lines.push("");
  lines.push("*Itens:*");
  for (const e of opts.entries) {
    const kindLabel = e.kind === "bundle" ? " (caixinha)" : "";
    lines.push(
      `• ${e.quantity}× ${e.title}${kindLabel} — ${formatBRL(e.priceCents)}`,
    );
  }
  lines.push("");
  if (opts.paymentMethod) {
    lines.push(`*Pagamento:* ${paymentLabel(opts.paymentMethod)}`);
  }
  if (opts.couponCode) {
    lines.push(`*Cupom:* ${opts.couponCode}`);
  }
  if (opts.notes) {
    lines.push("");
    lines.push(`*Observações:* ${opts.notes}`);
  }
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${opts.phone}?text=${text}`;
}

export function buildSingleProductUrl(opts: {
  title: string;
  priceCents: number | null;
  storeName: string;
  phone: string;
}): string {
  const lines: string[] = [];
  lines.push(
    `Olá! Tenho interesse em *${opts.title}* da *${opts.storeName}*.`,
  );
  lines.push(`Valor: ${formatBRL(opts.priceCents)}`);
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${opts.phone}?text=${text}`;
}

interface BundleItemLine {
  title: string;
  priceCents: number | null;
  quantity: number;
}

export function buildBundleUrl(opts: {
  title: string;
  priceCents: number | null;
  stampName?: string | null;
  items: BundleItemLine[];
  storeName: string;
  phone: string;
}): string {
  const lines: string[] = [];
  lines.push(
    `Olá! Tenho interesse na caixinha *${opts.title}* da *${opts.storeName}*.`,
  );
  if (opts.stampName) {
    lines.push(`*Estampa:* ${opts.stampName}`);
  }
  if (opts.items.length > 0) {
    lines.push("");
    lines.push("*Inclui:*");
    for (const it of opts.items) {
      const qty = it.quantity > 1 ? `${it.quantity}× ` : "";
      lines.push(`• ${qty}${it.title}`);
    }
  }
  lines.push("");
  lines.push(`*Valor:* ${formatBRL(opts.priceCents)}`);
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${opts.phone}?text=${text}`;
}

export function buildCustomOrderUrl(opts: {
  customerName: string;
  templateBoxTitle: string;
  stampName: string | null;
  items: BundleItemLine[];
  priceCents: number | null;
  note?: string | null;
  paymentMethod?: string;
  storeName: string;
  phone: string;
}): string {
  const lines: string[] = [];
  lines.push(
    `Olá! Eu, *${opts.customerName}*, quero encomendar uma caixinha na *${opts.storeName}*.`,
  );
  lines.push("");
  lines.push(`*Caixa base:* ${opts.templateBoxTitle}`);
  if (opts.stampName) lines.push(`*Estampa:* ${opts.stampName}`);
  if (opts.items.length > 0) {
    lines.push("");
    lines.push("*Itens:*");
    for (const it of opts.items) {
      const qty = it.quantity > 1 ? `${it.quantity}× ` : "";
      lines.push(`• ${qty}${it.title}`);
    }
  }
  lines.push("");
  lines.push(`*Valor estimado:* ${formatBRL(opts.priceCents)}`);
  if (opts.paymentMethod) {
    lines.push(`*Pagamento:* ${paymentLabel(opts.paymentMethod)}`);
  }
  if (opts.note) {
    lines.push("");
    lines.push(`*Observações:* ${opts.note}`);
  }
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${opts.phone}?text=${text}`;
}
