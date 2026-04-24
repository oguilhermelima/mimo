"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") ?? "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setPending(false);
    if (!res.ok) {
      setError("senha inválida");
      return;
    }
    router.replace(from);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Input
        type="password"
        placeholder="senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoFocus
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        Entrar
      </Button>
    </form>
  );
}
