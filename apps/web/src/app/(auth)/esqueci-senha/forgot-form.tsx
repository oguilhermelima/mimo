"use client";

import { useState } from "react";

import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";

import { authClient } from "~/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error: err } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/redefinir-senha",
    });

    setPending(false);

    if (err) {
      setError(err.message ?? "não foi possível enviar o email");
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="mt-6 rounded-md bg-rose-50 p-4 text-sm text-rose-900">
        Se o email estiver cadastrado, você receberá um link em instantes.
      </div>
    );
  }

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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "enviando…" : "Enviar link"}
      </Button>
    </form>
  );
}
