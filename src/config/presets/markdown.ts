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
    // ReDoS in the rule's `reversedPattern` (@eslint/markdown <=8.0.3): the
    // label group nests `[\s\S]*` inside a `*`, so a paragraph with many
    // parenthesised spans and no `)[` backtracks exponentially and hangs the
    // lint. Re-enable once eslint/markdown#690 ships.
    "markdown/no-reversed-media-syntax": "off",
    "markdown/no-space-in-emphasis": "error",
    "markdown/table-column-count": "error",
  },
} satisfies Linter.Config & { extends?: unknown; };
