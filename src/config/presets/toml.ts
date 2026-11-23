import type { Linter } from "eslint";

import toml from "../../plugins/toml/index.js";

export const tomlConfig = {
  files: ["**/*.toml"],
  language: "toml/toml",
  name: "toml",
  plugins: { toml },
  rules: {
    "no-irregular-whitespace": "off",
    "spaced-comment": "off",
    "toml/no-unreadable-number-separator": "error",
    "toml/precision-of-fractional-seconds": "error",
    "toml/precision-of-integer": "error",
  },
} satisfies Linter.Config;
