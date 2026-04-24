import { z } from "zod/v4";

import { USER_ROLES } from "@caixa/db/schema";

const onlyDigits = (s: string) => s.replace(/\D+/g, "");

function isValidCpf(raw: string): boolean {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number) as number[];

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (digits[i] ?? 0) * (10 - i);
  let dv1 = 11 - (sum % 11);
  if (dv1 >= 10) dv1 = 0;
  if (dv1 !== digits[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += (digits[i] ?? 0) * (11 - i);
  let dv2 = 11 - (sum % 11);
  if (dv2 >= 10) dv2 = 0;
  return dv2 === digits[10];
}

export const cpfSchema = z
  .string()
  .transform(onlyDigits)
  .refine((v) => v.length === 11, "CPF deve ter 11 dígitos")
  .refine(isValidCpf, "CPF inválido");

export const optionalCpfSchema = z
  .string()
  .optional()
  .transform((v) => (v ? onlyDigits(v) : undefined))
  .refine(
    (v) => v === undefined || v.length === 0 || isValidCpf(v),
    "CPF inválido",
  )
  .transform((v) => (v && v.length === 11 ? v : undefined));

export const phoneBrSchema = z
  .string()
  .transform(onlyDigits)
  .refine(
    (v) => v.length === 10 || v.length === 11,
    "telefone deve ter DDD + número",
  );

export const optionalPhoneSchema = z
  .string()
  .optional()
  .transform((v) => (v ? onlyDigits(v) : undefined))
  .refine(
    (v) => v === undefined || v.length === 10 || v.length === 11,
    "telefone deve ter DDD + número",
  );

export const signupSchema = z.object({
  name: z.string().min(2, "informe seu nome").max(120),
  email: z.email("email inválido").max(200),
  password: z
    .string()
    .min(8, "senha deve ter pelo menos 8 caracteres")
    .max(128),
  cpf: optionalCpfSchema,
  phone: optionalPhoneSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.email("email inválido"),
  password: z.string().min(1, "informe a senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.email("email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const userRoleSchema = z.enum(USER_ROLES);
