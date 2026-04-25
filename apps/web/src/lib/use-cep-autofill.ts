"use client";

import { useEffect, useRef, useState } from "react";

import { cleanCep, fetchCepAddress, type CepAddress } from "./cep";

/**
 * Observa um valor de CEP e dispara busca no ViaCEP quando atinge 8 dígitos.
 * Chama onResolve com o endereço encontrado — caller decide o que sobrescrever.
 */
export function useCepAutofill(
  cep: string,
  onResolve: (addr: CepAddress) => void,
) {
  const onResolveRef = useRef(onResolve);
  onResolveRef.current = onResolve;

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleaned = cleanCep(cep);
    if (cleaned.length !== 8) {
      setError(null);
      setPending(false);
      return;
    }

    const ctrl = new AbortController();
    setPending(true);
    setError(null);

    fetchCepAddress(cleaned, ctrl.signal)
      .then((addr) => {
        if (!addr) {
          setError("CEP não encontrado");
          return;
        }
        onResolveRef.current(addr);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("não consegui buscar o CEP");
      })
      .finally(() => setPending(false));

    return () => ctrl.abort();
  }, [cep]);

  return { pending, error };
}
