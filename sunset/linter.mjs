#!/usr/bin/env node
// Sunset stub. @askviraj/linter moved to @virajp.dev/linter; this package
// lints nothing. Every argument is ignored, the pointer goes to stderr, and the
// exit code is 1 so no script mistakes it for a successful run.
import process from "node:process";

process.stderr.write(
  [
    "@askviraj/linter has moved to @virajp.dev/linter.",
    "",
    "  npx @virajp.dev/linter [flags] [files...]",
    "  bunx --bun @virajp.dev/linter [flags] [files...]",
    "",
    "In eslint.config.mjs, change the import to:",
    "",
    "  export { default } from \"@virajp.dev/linter/auto\";",
    "",
    "https://github.com/virajp/linter",
    "This package lints nothing and will not be updated again.",
    "",
  ]
    .join("\n"),
);

process.exitCode = 1;
