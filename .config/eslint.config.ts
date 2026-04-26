import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import astro from "eslint-plugin-astro";
import eslintPluginToml from 'eslint-plugin-toml';
import yaml from "eslint-plugin-yml";
import {
  defineConfig,
  globalIgnores,
} from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import * as yamlParser from "yaml-eslint-parser";

export default defineConfig([
  // Basic ignores matching your monorepo structure
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/build/",
    "**/.astro/",
    "**/.turbo/",
    "**/.claude/**/*.md",
    "**/.github/**/*.md",
    "**/.planning/",
    "**/pnpm-lock.yaml",
  ]),

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...yaml.configs["flat/recommended"],
  ...markdown.configs.recommended,
  ...astro.configs.recommended,
  ...eslintPluginToml.configs.recommended,

  /**
   * Javascript/Typescript
   */
  {
    files: [
      "**/*.{js,mjs,cjs,ts,mts,cts,tsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    name: "typescript/javascript",
  },

  /**
   * Astro
   */
  {
    files: [
      "**/*.astro",
    ],
    languageOptions: {
      globals: {
        ...globals.astro,
      },
    },
    name: "astro",
  },

  /**
   * JSON files
   */
  {
    extends: ["json/recommended"],
    files: ["**/*.json"],
    ignores: ["**/tsconfig.json", "**/tsconfig-strict.json", "**/.vscode/*.json"],
    language: "json/json",
    name: "json",
    plugins: { json },
  },

  /**
   * JSON with comments
   */
  {
    extends: ["json/recommended"],
    files: ["**/*.jsonc", "**/tsconfig.json", "**/tsconfig-strict.json", "**/.vscode/*.json"],
    language: "json/jsonc",
    languageOptions: {
      allowTrailingCommas: true,
      allowComments: true,
    },
    name: "jsonc",
    plugins: { json },
  },

  /**
   * Markdown
   */
  {
    files: ["**/*.md"],
    name: "markdown",
    plugins: { markdown },
    // Use processor to avoid the ESLint v10.2.0 getLoc() error
    processor: "markdown/markdown",
  },

  /**
   * CSS
   */
  {
    files: ["**/*.css"],
    language: "css/css",
    name: "css",
    plugins: { css },
    rules: {
      // Use the recommended rules from the official plugin
      ...css.configs.recommended.rules,
    },
  },

  /**
   * YAML files
   */
  {
    files: ["**/*.yaml", "**/*.yml"],
    languageOptions: {
      parser: yamlParser,
    },
    name: "yaml",
    plugins: {
      yml: yaml,
    },
  },

  /**
   * TOML files
   */
  {
    files: ["*.toml", "**/*.toml"],
    plugins: {
      toml: eslintPluginToml,
    },
    language: "toml/toml",
  },

]);
