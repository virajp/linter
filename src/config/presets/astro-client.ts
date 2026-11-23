import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
import globals from "globals";

// The virtual files of the client <script> blocks that the processor
// astro/client-side-ts of the astro preset extracts. ESLint skips a code block
// that no files pattern matches. The language options are those of the
// upstream astro plugin v3.2.1 (MIT, see THIRD_PARTY_NOTICES.md),
// src/configs/flat/base.ts.

export const astroClientJsConfig = {
  name: "astro-client-js",
  files: ["**/*.astro/*.js"],
  languageOptions: {
    globals: {
      ...globals.browser,
    },
    sourceType: "module",
  },
  rules: {},
} satisfies Linter.Config;

export const astroClientTsConfig = {
  name: "astro-client-ts",
  files: ["**/*.astro/*.ts"],
  languageOptions: {
    globals: {
      ...globals.browser,
    },
    parser: tsParser,
    sourceType: "module",
    parserOptions: {
      project: null,
    },
  },
  rules: {},
} satisfies Linter.Config;
