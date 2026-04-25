export interface CepAddress {
  postalCode: string;
  street: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

export const cleanCep = (raw: string) => raw.replace(/\D+/g, "");

export function formatCep(raw: string) {
  const cep = cleanCep(raw).padStart(8, "0").slice(0, 8);
  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

/** Consulta ViaCEP (https://viacep.com.br). Retorna null se CEP não existe. */
export async function fetchCepAddress(
  raw: string,
  signal?: AbortSignal,
): Promise<CepAddress | null> {
  const cep = cleanCep(raw);
  if (cep.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal,
  });
  if (!res.ok) throw new Error("Erro ao consultar CEP");

  const data = (await res.json()) as ViaCepResponse;
  if (data.erro) return null;

  return {
    postalCode: cep,
    street: data.logradouro?.trim() ?? "",
    complement: data.complemento?.trim() ?? "",
    district: data.bairro?.trim() ?? "",
    city: data.localidade?.trim() ?? "",
    state: (data.uf ?? "").toUpperCase(),
  };
}
