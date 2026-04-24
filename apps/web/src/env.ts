import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    DATABASE_URL: z.url(),
    ADMIN_PASSWORD: z.string().min(6),
    ADMIN_SESSION_SECRET: z.string().min(16),
  },
  client: {
    NEXT_PUBLIC_STORE_NAME: z.string().default("Mimo"),
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
