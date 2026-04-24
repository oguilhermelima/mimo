import type { CartEntry } from "./cart-store";
import { formatBRL, paymentLabel } from "./format";

interface BuildOpts {
  entries: CartEntry[];
  paymentMethod?: string;
  notes?: string;
  storeName: string;
  phone: string;
}

export function buildWhatsAppUrl(opts: BuildOpts): string {
  const lines: string[] = [];
  lines.push(`Olá! Quero encomendar na *${opts.storeName}*.`);
  lines.push("");
  lines.push("*Itens:*");
  for (const e of opts.entries) {
    const price = formatBRL(e.priceCents);
    lines.push(`• ${e.quantity}× ${e.title} — ${price}`);
    if (e.childIds.length > 0) {
      lines.push(`    inclui ${e.childIds.length} item(s) da caixa`);
    }
  }
  lines.push("");
  if (opts.paymentMethod) {
    lines.push(`*Pagamento:* ${paymentLabel(opts.paymentMethod)}`);
  }
  if (opts.notes) {
    lines.push("");
    lines.push(`*Observações:* ${opts.notes}`);
  }
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${opts.phone}?text=${text}`;
}

interface SingleProductChild {
  title: string;
  priceCents: number | null;
}

export function buildSingleProductUrl(opts: {
  title: string;
  priceCents: number | null;
  totalPriceCents?: number | null;
  children?: SingleProductChild[];
  storeName: string;
  phone: string;
}): string {
  const lines: string[] = [];
  lines.push(
    `Olá! Tenho interesse na caixinha *${opts.title}* da *${opts.storeName}*.`,
  );

  if (opts.children && opts.children.length > 0) {
    lines.push("");
    lines.push("*Itens selecionados:*");
    lines.push(`• Caixa base — ${formatBRL(opts.priceCents)}`);
    for (const c of opts.children) {
      lines.push(`• ${c.title} — ${formatBRL(c.priceCents)}`);
    }
    lines.push("");
    const total =
      opts.totalPriceCents != null ? formatBRL(opts.totalPriceCents) : null;
    if (total) lines.push(`*Total estimado:* ${total}`);
  } else {
    lines.push(`Valor: ${formatBRL(opts.priceCents)}`);
  }

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${opts.phone}?text=${text}`;
}
