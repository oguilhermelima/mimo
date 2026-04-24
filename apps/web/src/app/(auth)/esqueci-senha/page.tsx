import Link from "next/link";

import { ForgotPasswordForm } from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="font-serif text-3xl text-primary">Esqueci a senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          informe seu email — vamos enviar um link
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Lembrou?{" "}
        <Link href="/entrar" className="text-primary hover:underline">
          Voltar pro login
        </Link>
      </p>
    </>
  );
}
