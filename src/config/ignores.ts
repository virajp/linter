import { globalIgnores } from "eslint/config";

export const ignores = globalIgnores([
  "**/node_modules/",
  "**/dist/",
  "**/.turbo/",
  "**/.astro/",
  "**/*.d.ts",
  "**/AGENTS.md",
  ".agents/**/*.md",
  ".claude/**/*.md",
  ".github/**/*.md",
]);
