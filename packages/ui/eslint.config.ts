import { defineConfig } from "eslint/config";

import { baseConfig } from "@caixa/eslint-config/base";
import { reactConfig } from "@caixa/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
