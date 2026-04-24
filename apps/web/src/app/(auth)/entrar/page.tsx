import { Suspense } from "react";
import Link from "next/link";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="font-serif text-3xl text-primary">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          acesse sua conta com email e senha
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/cadastrar" className="text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </>
  );
}
