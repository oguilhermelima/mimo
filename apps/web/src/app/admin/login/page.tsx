import { Suspense } from "react";

import { Logo } from "~/components/logo";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto mt-20 max-w-sm rounded-2xl bg-card p-8 ring-1 ring-border/40 md:mt-32">
      <Logo
        variant="stacked"
        withTagline
        className="mb-6"
        markClassName="size-14"
      />
      <div className="text-center">
        <h1 className="font-serif text-3xl text-primary">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          acesso restrito à gerência da loja.
        </p>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
