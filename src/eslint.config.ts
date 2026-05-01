import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import html from "@html-eslint/eslint-plugin";
import tailwindcss from "@poupe/eslint-plugin-tailwindcss";
// import stylistic from "@stylistic/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import astroParser from "astro-eslint-parser";
import astro from "eslint-plugin-astro";
import eslintPluginToml from "eslint-plugin-toml";
import yaml from "eslint-plugin-yml";
import {
  defineConfig,
  globalIgnores,
} from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import * as yamlParser from "yaml-eslint-parser";

const JSONC_FILES = [
  "**/tsconfig.json",
  "**/tsconfig.*.json",
  "**/tsconfig-strict.json",
  "**/.vscode/*.json",
];

export default defineConfig([
  // Basic ignores matching your monorepo structure
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/.turbo/",
    "**/.astro/",
    "**/*.d.ts",
    "**/AGENTS.md",
    ".agents/**/*.md",
    ".claude/**/*.md",
    ".github/**/*.md",
  ]),

  /**
   * Javascript
   */
  {
    extends: [
      js.configs.recommended,
    ],
    files: [
      "**/*.{js,mjs,cjs,jsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    name: "javascript",
    plugins: { js },
    rules: {
      // Javascript-specific rules
      // Ref: https://eslint.org/docs/latest/rules/
    },
  },

  /**
   * Typescript
   */
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      // stylistic.configs.recommended,
    ],
    files: [
      "**/*.{ts,mts,cts,tsx}",
    ],
    ignores: [
      "**/*.md/*.ts",
      "**/*.md/*.tsx",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    name: "typescript",
    plugins: {
      js,
      tseslint,
      // "@stylistic": stylistic,
    },
    rules: {
      // Typescript-specific rules
      // Ref: https://typescript-eslint.io/rules/
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^(_.*|.*Schema)$",
          varsIgnorePattern: "^(_.*|.*Schema)$",
        },
      ],
      "require-yield": "off",
      // Stylistic rules
      // Ref: https://eslint.style/rules
      // "@stylistic/array-bracket-newline": [
      //   "error",
      //   { minItems: 1 },
      // ],
      // "@stylistic/quote-props": "off",
      // "@stylistic/quotes": [
      //   "error",
      //   "double",
      //   {
      //     avoidEscape: true,
      //     allowTemplateLiterals: "always",
      //   },
      // ],
      // "@stylistic/semi": [
      //   "error",
      //   "always",
      // ],
      // "@stylistic/array-element-newline": [
      //   "error",
      //   { minItems: 1 },
      // ],
      // "@stylistic/arrow-parens": [
      //   "error",
      //   "as-needed",
      //   { requireForBlockBody: true },
      // ],
      // "@stylistic/arrow-spacing": [
      //   "error",
      //   {
      //     before: true,
      //     after: true,
      //   },
      // ],
      // "@stylistic/block-spacing": [
      //   "error",
      //   "always",
      // ],
      // "@stylistic/brace-style": "off",
      // "@stylistic/comma-dangle": [
      //   "error",
      //   "only-multiline",
      // ],
      // "@stylistic/comma-spacing": [
      //   "error",
      //   {
      //     before: false,
      //     after: true,
      //   },
      // ],
      // "@stylistic/comma-style": [
      //   "error",
      //   "last",
      // ],
      // "@stylistic/dot-location": [
      //   "error",
      //   "property",
      // ],
      // "@stylistic/eol-last": [
      //   "error",
      //   "always",
      // ],
      // "@stylistic/function-call-spacing": [
      //   "error",
      //   "never",
      // ],
      // "@stylistic/function-paren-newline": "off",
      // "@stylistic/generator-star-spacing": "off",
      // "@stylistic/implicit-arrow-linebreak": "off",
      // "@stylistic/indent": "off",
      // "@stylistic/operator-linebreak": "off",
      // "@stylistic/indent-binary-ops": "off",
      // "@stylistic/key-spacing": [
      //   "error",
      //   {
      //     beforeColon: false,
      //     afterColon: true,
      //     mode: "strict",
      //   },
      // ],
      // "@stylistic/lines-between-class-members": [
      //   "error",
      //   "always",
      // ],
      // "@stylistic/member-delimiter-style": "off",
      // "@stylistic/exp-list-style": "off",
      // "@stylistic/max-len": [
      //   "warn",
      //   {
      //     code: 120,
      //     tabWidth: 2,
      //     comments: 120,
      //     ignoreComments: false,
      //     ignoreTrailingComments: true,
      //     ignoreUrls: true,
      //     ignoreStrings: true,
      //     ignoreTemplateLiterals: true,
      //     ignoreRegExpLiterals: true,
      //   },
      // ],
      // "@stylistic/new-parens": [
      //   "error",
      //   "always",
      // ],
      // "@stylistic/newline-per-chained-call": [
      //   "error",
      //   {
      //     ignoreChainWithDepth: 2,
      //   },
      // ],
      // "@stylistic/no-confusing-arrow": [
      //   "error",
      //   {
      //     allowParens: true,
      //     onlyOneSimpleParam: false,
      //   },
      // ],
      // "@stylistic/no-mixed-operators": "error",
      // "@stylistic/nonblock-statement-body-position": [
      //   "error",
      //   "beside",
      // ],
      // "@stylistic/wrap-iife": [
      //   "error",
      //   "inside",
      // ],
      // "@stylistic/wrap-regex": "error",
      // "@stylistic/yield-star-spacing": [
      //   "error",
      //   "after",
      // ],
    },
  },

  /**
   * Astro
   */
  {
    name: "astro",
    files: [
      "**/*.astro",
    ],
    plugins: { astro },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.astro,
      },
      parser: astroParser, // Use the Astro parser
      parserOptions: {
        parser: tsParser, // Use TS parser for the script blocks inside Astro
        extraFileExtensions: [
          ".astro",
        ],
        sourceType: "module",
      },
    },
    extends: [
      astro.configs.recommended,
    ],
    rules: {
      // Astro-specific rules
      // Ref: https://ota-meshi.github.io/eslint-plugin-astro/rules/

      // This rule often triggers the false positive in Astro frontmatter
      "no-unreachable": "off",
    },
  },

  /**
   * JSON files
   */
  {
    extends: [
      json.configs.recommended,
    ],
    files: [
      "**/*.json",
    ],
    ignores: JSONC_FILES,
    language: "json/json",
    name: "json",
    plugins: { json },
    rules: {
      // JSON-specific rules
      // Ref: https://github.com/eslint/json
      "json/no-duplicate-keys": "error",
      "json/no-empty-keys": "error",
      "json/no-unnormalized-keys": "error",
      "json/no-unsafe-values": "error",
      "json/sort-keys": "off",
      "json/top-level-interop": "error",
    },
  },

  /**
   * JSON with comments
   */
  {
    extends: [
      json.configs.recommended,
    ],
    files: [
      "**/*.jsonc",
      ...JSONC_FILES,
    ],
    language: "json/jsonc",
    languageOptions: {
      allowComments: true,
      allowTrailingCommas: true,
    },
    name: "jsonc",
    plugins: { json },
    rules: {
      // JSON-specific rules (applicable to JSONC as well)
      // Ref: https://github.com/eslint/json
      "json/no-duplicate-keys": "error",
      "json/no-empty-keys": "error",
      "json/no-unnormalized-keys": "error",
      "json/no-unsafe-values": "error",
      "json/sort-keys": "off",
      "json/top-level-interop": "error",
    },
  },

  /**
   * Markdown
   */
  {
    extends: [
      markdown.configs.recommended,
    ],
    files: [
      "**/*.md",
    ],
    name: "markdown",
    plugins: { markdown },
    settings: { "markdown/frontmatter": true },
    rules: {
      // Markdown-specific rules
      // Ref: https://github.com/eslint/markdown
      "markdown/no-missing-label-refs": "off",
      "markdown/no-bare-urls": "error",
      "markdown/no-duplicate-headings": [
        "error",
        { checkSiblingsOnly: true },
      ],
      "markdown/no-empty-images": "error",
      "markdown/no-empty-links": "error",
      "markdown/no-missing-link-fragments": "error",
      "markdown/no-multiple-h1": "error",
      "markdown/no-reference-like-urls": "error",
      "markdown/no-reversed-media-syntax": "error",
      "markdown/no-space-in-emphasis": "error",
      "markdown/table-column-count": "error",
    },
  },
  {
    // This matches the virtual files created by the markdown plugin
    name: "markdown-typescript",
    files: [
      "**/*.md/*.ts",
      "**/*.md/*.tsx",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },

  /**
   * YAML files
   */
  {
    extends: [
      yaml.configs["flat/recommended"],
    ],
    files: [
      "**/*.yaml",
      "**/*.yml",
    ],
    languageOptions: { parser: yamlParser },
    name: "yaml",
    plugins: { yml: yaml },
    rules: {
      // YAML-specific rules
      // Ref: https://ota-meshi.github.io/eslint-plugin-yml/rules/
    },
  },

  /**
   * TOML files
   */
  {
    extends: [
      eslintPluginToml.configs.recommended,
    ],
    files: [
      "**/*.toml",
    ],
    language: "toml/toml",
    name: "toml",
    plugins: { toml: eslintPluginToml },
    rules: {
      // TOML-specific rules
      // Ref: https://ota-meshi.github.io/eslint-plugin-toml/rules/
    },
  },

  /**
   * HTML files
   */
  {
    extends: [
      html.configs.recommended,
    ],
    files: [
      "**/*.html",
    ],
    language: "html/html",
    name: "html",
    plugins: { html },
    rules: {
      // HTML-specific rules
      // Ref: https://html-eslint.org/docs/rules
    },
  },

  /**
   * CSS
   */
  {
    files: [
      "**/*.css",
    ],
    extends: [
      css.configs.recommended,
      tailwindcss.configs["recommended"]!,
    ],
    // language: "css/css",
    name: "css",
    // plugins: { css },
    rules: {
      // CSS & Tailwind specific rules
      // Ref: https://github.com/eslint/css/tree/main/docs/rules
      // Ref: https://github.com/poupe-ui/eslint-plugin-tailwindcss/tree/main/docs/rules

      // Tailwind directives are valid — handled by tailwindcss/css
      "css/no-invalid-at-rules": "off",
    },
  },
]);
