import css from "@eslint/css";
import type { Linter } from "eslint";

import tailwindcss, { tailwindSyntax } from "../../plugins/tailwindcss/index.js";

export const cssConfig = {
  files: ["**/*.css"],
  extends: [css.configs.recommended],
  language: "css/css",
  languageOptions: { tolerant: true, customSyntax: tailwindSyntax },
  name: "css",
  plugins: { tailwindcss },
  rules: {
    "css/no-invalid-at-rules": "off",
    "tailwindcss/no-duplicate-imports": "error",
    "tailwindcss/no-duplicate-reference": "error",
    "tailwindcss/no-empty-blocks": "error",
    "tailwindcss/no-important": "warn",
    "tailwindcss/no-invalid-at-rules": "error",
    "tailwindcss/no-invalid-named-grid-areas": "error",
    "tailwindcss/no-invalid-properties": "error",
    "tailwindcss/no-arbitrary-value-overuse": ["warn", {
      maxPerFile: 10,
      maxPerRule: 3,
    }],
    "tailwindcss/no-conflicting-utilities": "error",
    "tailwindcss/prefer-theme-tokens": ["warn", {
      categories: ["colors", "spacing"],
    }],
    "tailwindcss/use-baseline": "error",
    "tailwindcss/valid-apply-directive": ["error", { maxUtilities: 20 }],
    "tailwindcss/valid-modifier-syntax": "error",
    "tailwindcss/valid-theme-function": "error",
  },
} satisfies Linter.Config & { extends?: unknown };
