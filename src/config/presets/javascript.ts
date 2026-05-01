import js from "@eslint/js";
import type { Linter } from "eslint";
import globals from "globals";
export const javascriptConfig = {
  extends: [js.configs.recommended],
  files: ["**/*.{js,mjs,cjs,jsx}"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  name: "javascript",
  plugins: { js },
  rules: {},
} satisfies Linter.Config & { extends?: unknown; };
