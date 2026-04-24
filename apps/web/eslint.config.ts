import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@caixa/eslint-config/base";
import { nextjsConfig } from "@caixa/eslint-config/nextjs";
import { reactConfig } from "@caixa/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
