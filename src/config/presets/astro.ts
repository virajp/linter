import tsParser from "@typescript-eslint/parser";
import * as astroParser from "astro-eslint-parser";
import type { Linter } from "eslint";
import globals from "globals";
import astro from "../../plugins/astro/index.js";

export const astroConfig = {
  name: "astro",
  files: ["**/*.astro"],
  plugins: { astro },
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.astro,
    },
    parser: astroParser,
    parserOptions: {
      parser: tsParser,
      extraFileExtensions: [".astro"],
      sourceType: "module",
    },
  },
  processor: "astro/client-side-ts",
  rules: {
    "astro/missing-client-only-directive-value": "error",
    "astro/no-conflict-set-directives": "error",
    "astro/no-deprecated-astro-canonicalurl": "error",
    "astro/no-deprecated-astro-fetchcontent": "error",
    "astro/no-deprecated-astro-resolve": "error",
    "astro/no-deprecated-getentrybyslug": "error",
    "astro/no-exports-from-components": "error",
    "astro/no-prerender-export-outside-pages": "error",
    "astro/no-unused-define-vars-in-style": "error",
    "no-unreachable": "off",
  },
} satisfies Linter.Config;
