import type { Linter } from "eslint";

import html from "../../plugins/html/index.js";

export const htmlConfig = {
  files: ["**/*.html"],
  language: "html/html",
  name: "html",
  plugins: { html },
  rules: {
    "html/require-lang": "error",
    "html/require-img-alt": "error",
    "html/require-doctype": "error",
    "html/require-title": "error",
    "html/no-multiple-h1": "error",
    // Void elements must self-close (`<img ... />`), same as the dprint
    // markup formatter writes them.
    "html/no-extra-spacing-tags": ["error", { enforceBeforeSelfClose: true }],
    "html/attrs-newline": "error",
    "html/element-newline": ["error", { inline: ["$inline"] }],
    "html/no-duplicate-id": "error",
    "html/indent": ["error", 2],
    "html/require-li-container": "error",
    "html/quotes": "error",
    "html/no-obsolete-tags": "error",
    "html/no-obsolete-attrs": "error",
    "html/require-closing-tags": ["error", { selfClosing: "always" }],
    "html/no-duplicate-attrs": "error",
    "html/use-baseline": "error",
    "html/no-duplicate-in-head": "error",
  },
} satisfies Linter.Config;
