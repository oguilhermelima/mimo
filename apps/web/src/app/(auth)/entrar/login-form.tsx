"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";
import { toast } from "@caixa/ui/toast";

import { authClient } from "~/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error: err } = await authClient.signIn.email({
      email,
      password,
      callbackURL: from,
      rememberMe: true,
    });

    setPending(false);

    if (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        toast.info("verifique seu email pra continuar");
        router.replace(`/verificar-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(err.message ?? "email ou senha inválidos");
      return;
    }

    router.replace(from);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link
            href="/esqueci-senha"
            className="text-xs text-primary hover:underline"
          >
            esqueci
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
