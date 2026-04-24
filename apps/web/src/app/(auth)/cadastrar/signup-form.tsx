"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@caixa/ui/button";
import { Input } from "@caixa/ui/input";
import { Label } from "@caixa/ui/label";

import { signupSchema } from "@caixa/validators";

import { authClient } from "~/lib/auth-client";
import { digits, maskCpf, maskPhoneBr } from "~/lib/format-input";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const parsed = signupSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      password,
      cpf: cpf.trim() || undefined,
      phone: phone.trim() || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setPending(false);
      return;
    }

    const { error } = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      cpf: parsed.data.cpf,
      phone: parsed.data.phone,
      callbackURL: "/entrar",
    });

    setPending(false);

    if (error) {
      setErrors({ form: error.message ?? "não foi possível criar a conta" });
      return;
    }

    router.replace(
      `/verificar-email?email=${encodeURIComponent(parsed.data.email)}`,
    );
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-invalid={!!errors.name}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
        <p className="text-xs text-muted-foreground">
          mínimo 8 caracteres
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cpf">
            CPF <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="cpf"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            maxLength={14}
            aria-invalid={!!errors.cpf}
          />
          {errors.cpf && (
            <p className="text-xs text-destructive">{errors.cpf}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Telefone <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(maskPhoneBr(e.target.value))}
            placeholder="(11) 99999-9999"
            maxLength={16}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || !name || !email || !password}
      >
        {pending ? "criando conta…" : "Criar conta"}
      </Button>
    </form>
  );
}
