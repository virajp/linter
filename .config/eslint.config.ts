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
  ]),

  /**
   * Javascript
   */
  {
    files: [
      "**/*.{js,mjs,cjs,jsx}",
    ],
    plugins: { js },
    extends: [ js.configs.recommended ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    name: "javascript",
  },

  /**
   * Typescript
   */
  {
    files: [
      "**/*.{ts,mts,cts,tsx}",
    ],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    plugins: { js, tseslint },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    name: "typescript",
  },

  /**
   * Astro
   */
  {
    files: [
      "**/*.astro",
    ],
    plugins: { astro },
    extends: [
      js.configs.recommended,
      astro.configs.recommended,
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
    extends: [ json.configs.recommended ],
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
    extends: [ json.configs.recommended ],
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
    extends: [ markdown.configs.recommended ],
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
    extends: [ css.configs.recommended ],
  },

  /**
   * YAML files
   */
  {
    files: ["**/*.yaml", "**/*.yml"],
    extends: [ yaml.configs["flat/recommended"] ],
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
    extends: [ eslintPluginToml.configs.recommended ],
    plugins: {
      toml: eslintPluginToml,
    },
    name: "toml",
    language: "toml/toml",
  },

]);
