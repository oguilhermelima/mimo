import { defineConfig } from "eslint/config";

import { baseConfig } from "@caixa/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
);
