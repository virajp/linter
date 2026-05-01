import type { Linter } from "eslint";

export const markdownTsConfig = {
  name: "markdown-typescript",
  files: ["**/*.md/*.ts", "**/*.md/*.tsx"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-expressions": "off",
  },
} satisfies Linter.Config;
