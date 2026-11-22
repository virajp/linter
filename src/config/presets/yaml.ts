import type { Linter } from "eslint";

import yml from "../../plugins/yml/index.js";

export const yamlConfig = {
  files: ["**/*.yaml", "**/*.yml"],
  language: "yml/yaml",
  name: "yaml",
  plugins: { yml },
  rules: {
    "no-irregular-whitespace": "off",
    "no-unused-vars": "off",
    "spaced-comment": "off",
    "yml/no-empty-document": "error",
    "yml/no-empty-key": "error",
    "yml/no-empty-mapping-value": "error",
    "yml/no-empty-sequence-entry": "error",
    "yml/no-irregular-whitespace": "error",
    "yml/no-tab-indent": "error",
  },
} satisfies Linter.Config;
