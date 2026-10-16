import html from "@html-eslint/eslint-plugin";
import type { Linter } from "eslint";

export const htmlConfig = {
  extends: [html.configs.recommended],
  files: ["**/*.html"],
  language: "html/html",
  name: "html",
  plugins: { html },
  rules: {
    "html/indent": ["error", 2],
  },
} satisfies Linter.Config & { extends?: unknown };
