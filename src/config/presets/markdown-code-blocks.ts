import markdown from "@eslint/markdown";
import type { Linter } from "eslint";

// Fenced JS/TS code blocks in Markdown are snippets, not modules: they use
// names they never declare and declare names they never use. Start from the
// plugin's own relaxations for code blocks, then turn off the TypeScript
// equivalents. Blocks in the other languages (json, yaml, css, ...) are linted
// by their own presets with no relaxations.
const pluginCodeBlocks = markdown.configs.processor.find(
  c => c.name === "markdown/recommended/code-blocks",
);

export const markdownCodeBlocksConfig = {
  name: "markdown-code-blocks",
  files: ["**/*.md/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
  rules: {
    ...pluginCodeBlocks?.rules,
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
} satisfies Linter.Config;
