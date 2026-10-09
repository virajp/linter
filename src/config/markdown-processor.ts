import markdown from "@eslint/markdown";
import type { Linter } from "eslint";

// ESLint cannot lint a file's Markdown content and its fenced code blocks in
// one run: with a processor, only the extracted blocks are linted. So this
// config is not part of the base config. runLint appends it for a second pass
// over the Markdown files, and merges the two results.
export const markdownProcessorConfig = {
  name: "markdown-processor",
  files: ["**/*.md"],
  plugins: { markdown },
  processor: "markdown/markdown",
} satisfies Linter.Config;
