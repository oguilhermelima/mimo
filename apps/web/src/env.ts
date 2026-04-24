import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .pipe(z.url().optional());

const optionalEmail = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .pipe(z.email().optional());

const optionalMin = (min: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().min(min).optional());

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: optionalUrl,
    RESEND_API_KEY: optionalMin(1),
    RESEND_FROM: z.email().default("onboarding@resend.dev"),
    BLOB_READ_WRITE_TOKEN: optionalMin(1),
    INITIAL_ADMIN_EMAIL: optionalEmail,
    INITIAL_ADMIN_PASSWORD: optionalMin(8),
  },
  client: {
    NEXT_PUBLIC_STORE_NAME: z.string().default("Encantim"),
    NEXT_PUBLIC_WHATSAPP_NUMBER: z
      .string()
      .regex(/^\d{10,15}$/, "apenas dígitos (DDI+DDD+número)"),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.CI ||
    process.env.npm_lifecycle_event === "lint",
});
