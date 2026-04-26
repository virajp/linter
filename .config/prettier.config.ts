import { type Config } from "prettier";

// const GLOBAL_IGNORES = ["node_modules", "dist", "build", "coverage"];

const config: Config = {
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      options: {
        parser: "typescript",
      },
    },
  ],
  bracketSpacing: true,
  jsxBracketSameLine: true,
  arrowParens: "always",
  endOfLine: "lf",
};

export default config;
