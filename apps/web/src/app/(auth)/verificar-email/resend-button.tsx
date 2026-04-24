"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@caixa/ui/button";
import { toast } from "@caixa/ui/toast";

import { authClient } from "~/lib/auth-client";

export function ResendVerificationButton() {
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const [pending, setPending] = useState(false);

  if (!email) return null;

  const resend = async () => {
    setPending(true);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/entrar",
    });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "não foi possível reenviar");
      return;
    }
    toast.success("email reenviado");
  };

  return (
    <div className="mt-6 space-y-3 text-center">
      <p className="text-sm text-muted-foreground">
        enviado pra{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={resend}
        disabled={pending}
      >
        {pending ? "reenviando…" : "Reenviar email"}
      </Button>
    </div>
  );
}
