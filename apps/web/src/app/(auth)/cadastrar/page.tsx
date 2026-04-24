import Link from "next/link";

import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="font-serif text-3xl text-primary">Criar conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          informe seus dados pra começar
        </p>
      </div>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/entrar" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </>
  );
}
