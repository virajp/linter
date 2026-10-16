import type { Linter } from "eslint";
import yaml from "eslint-plugin-yml";
import * as yamlParser from "yaml-eslint-parser";

export const yamlConfig = {
  extends: [yaml.configs["flat/recommended"]],
  files: ["**/*.yaml", "**/*.yml"],
  languageOptions: { parser: yamlParser },
  name: "yaml",
  plugins: { yml: yaml },
  rules: {},
} satisfies Linter.Config & { extends?: unknown };
