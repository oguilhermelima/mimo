export function formatBRL(cents: number | null | undefined): string {
  if (cents == null) return "sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
  depth: number | null | undefined,
): string | null {
  const parts = [width, height, depth].filter((n): n is number => n != null);
  if (parts.length === 0) return null;
  return parts.map((n) => `${n}mm`).join(" × ");
}

export function paymentLabel(method: string): string {
  switch (method) {
    case "pix":
      return "Pix";
    case "credito":
      return "Cartão de crédito";
    case "debito":
      return "Cartão de débito";
    case "ted":
      return "TED";
    default:
      return method;
  }
}
