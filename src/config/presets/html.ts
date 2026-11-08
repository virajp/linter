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
    // Void elements must self-close (`<img ... />`), same as the dprint
    // markup formatter writes them.
    "html/no-extra-spacing-tags": ["error", { enforceBeforeSelfClose: true }],
    "html/require-closing-tags": ["error", { selfClosing: "always" }],
  },
} satisfies Linter.Config & { extends?: unknown };
