// Sunset stub. @askviraj/linter moved to @virajp.dev/linter; importing this
// package (or its ./auto export) fails with the new import line.
throw new Error(
  [
    "@askviraj/linter has moved to @virajp.dev/linter.",
    "In eslint.config.mjs, change the import to:",
    "  export { default } from \"@virajp.dev/linter/auto\";",
    "https://github.com/virajp/linter",
  ]
    .join("\n"),
);
