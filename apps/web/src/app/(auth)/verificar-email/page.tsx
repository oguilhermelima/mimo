import { Suspense } from "react";
import Link from "next/link";

import { ResendVerificationButton } from "./resend-button";

export default function VerifyEmailPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="font-serif text-3xl text-primary">Confirme seu email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos um link de confirmação. Abra o email e clique pra ativar sua
          conta.
        </p>
      </div>
      <Suspense fallback={null}>
        <ResendVerificationButton />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já confirmou?{" "}
        <Link href="/entrar" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
