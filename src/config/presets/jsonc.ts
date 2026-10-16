import json from "@eslint/json";
import type { Linter } from "eslint";
import { JSONC_FILES } from "../jsonc-files.js";

export const jsoncConfig = {
  extends: [json.configs.recommended],
  files: ["**/*.jsonc", ...JSONC_FILES],
  language: "json/jsonc",
  languageOptions: {
    allowComments: true,
    allowTrailingCommas: true,
  },
  name: "jsonc",
  plugins: { json },
  rules: {
    "json/no-duplicate-keys": "error",
    "json/no-empty-keys": "error",
    "json/no-unnormalized-keys": "error",
    "json/no-unsafe-values": "error",
    "json/sort-keys": "off",
    "json/top-level-interop": "error",
  },
} satisfies Linter.Config & { extends?: unknown };
