import { Suspense } from "react";
import Link from "next/link";

import { ResetPasswordForm } from "./reset-form";

export default function ResetPasswordPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="font-serif text-3xl text-primary">Nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          escolha uma senha com pelo menos 8 caracteres
        </p>
      </div>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/entrar" className="text-primary hover:underline">
          Voltar pro login
        </Link>
      </p>
    </>
  );
}
