import markdown from "@eslint/markdown";
import type { Linter } from "eslint";

export const markdownConfig = {
  extends: [markdown.configs.recommended],
  files: ["**/*.md"],
  name: "markdown",
  plugins: { markdown },
  settings: { "markdown/frontmatter": true },
  rules: {
    "markdown/no-missing-label-refs": "off",
    "markdown/no-bare-urls": "error",
    "markdown/no-duplicate-headings": ["error", { checkSiblingsOnly: true }],
    "markdown/no-empty-images": "error",
    "markdown/no-empty-links": "error",
    "markdown/no-missing-link-fragments": "error",
    "markdown/no-multiple-h1": "error",
    "markdown/no-reference-like-urls": "error",
    "markdown/no-reversed-media-syntax": "error",
    "markdown/no-space-in-emphasis": "error",
    "markdown/table-column-count": "error",
  },
} satisfies Linter.Config & { extends?: unknown; };
