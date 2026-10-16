import css from "@eslint/css";
import tailwindcss from "@poupe/eslint-plugin-tailwindcss";
import type { Linter } from "eslint";

export const cssConfig = {
  files: ["**/*.css"],
  extends: [css.configs.recommended, tailwindcss.configs["recommended"]!],
  name: "css",
  rules: {
    "css/no-invalid-at-rules": "off",
  },
} satisfies Linter.Config & { extends?: unknown };
