import tsParser from "@typescript-eslint/parser";
import astroParser from "astro-eslint-parser";
import astro from "eslint-plugin-astro";
import globals from "globals";

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
  extends: [astro.configs.recommended],
  rules: {
    "no-unreachable": "off",
  },
};
