import js from "@eslint/js";
import type { Linter } from "eslint";
import globals from "globals";
import tseslint from "typescript-eslint";

export const typescriptConfig = {
  extends: [js.configs.recommended, tseslint.configs.recommended],
  files: ["**/*.{ts,mts,cts,tsx}"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  name: "typescript",
  plugins: {
    js,
    tseslint,
  },
  rules: {
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-unsafe-function-type": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^(_.*|.*Schema)$",
        varsIgnorePattern: "^(_.*|.*Schema)$",
      },
    ],
    "require-yield": "off",
  },
} satisfies Linter.Config & { extends?: unknown; };
