import markdown from "@eslint/markdown";
import type { Linter } from "eslint";

export const markdownConfig = {
  extends: [markdown.configs.recommended],
  files: ["**/*.md"],
  // Frontmatter is a LANGUAGE option, not a setting. It was previously written
  // as `settings: { "markdown/frontmatter": true }`, which ESLint accepts and
  // silently ignores — unknown `settings` keys are never validated — so
  // frontmatter was parsed as markdown body. A YAML comment inside it
  // (`# note`) then became an H1, and the document's real title tripped
  // no-multiple-h1 as the second one.
  languageOptions: { frontmatter: "yaml" },
  name: "markdown",
  plugins: { markdown },
  rules: {
    "markdown/no-missing-label-refs": "off",
    "markdown/no-bare-urls": "error",
    "markdown/no-duplicate-headings": ["error", { checkSiblingsOnly: true }],
    "markdown/no-empty-images": "error",
    "markdown/no-empty-links": "error",
    "markdown/no-missing-link-fragments": "error",
    // `frontmatterTitle: ""` disables the rule's default assumption that a
    // frontmatter `title:` IS the document's H1 — which would make the body's
    // own `# Title` a second one. Here the two coexist by convention (the
    // frontmatter title is metadata for tooling, the H1 is for the reader), so
    // only real headings are counted. Without this, turning frontmatter parsing
    // on above would fail every document that has both.
    "markdown/no-multiple-h1": ["error", { frontmatterTitle: "" }],
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
