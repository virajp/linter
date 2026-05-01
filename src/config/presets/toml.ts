import type { Linter } from "eslint";
import eslintPluginToml from "eslint-plugin-toml";

export const tomlConfig = {
  extends: [eslintPluginToml.configs.recommended],
  files: ["**/*.toml"],
  language: "toml/toml",
  name: "toml",
  plugins: { toml: eslintPluginToml },
  rules: {},
} satisfies Linter.Config & { extends?: unknown; };
