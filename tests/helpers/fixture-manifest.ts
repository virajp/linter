export const FIXTURES = {
  javascript: {
    valid: "javascript/valid.js",
    unusedVars: "javascript/unused-vars.js",
    noUndef: "javascript/no-undef.js",
    debuggerStatement: "javascript/debugger-statement.js",
    consoleWarn: "javascript/console-warn.js",
  },
  typescript: {
    valid: "typescript/valid.ts",
    noRequireImports: "typescript/no-require-imports.ts",
    noUnusedVars: "typescript/no-unused-vars.ts",
    preferAsConst: "typescript/prefer-as-const.ts",
  },
  astro: {
    valid: "astro/valid.astro",
    deprecatedResolve: "astro/deprecated-resolve.astro",
  },
  json: {
    valid: "json/valid.json",
    trailingComma: "json/trailing-comma.json",
  },
  jsonc: {
    valid: "jsonc/valid.jsonc",
    missingComma: "jsonc/missing-comma.jsonc",
  },
  markdown: {
    valid: "markdown/valid.md",
    emptyLinks: "markdown/empty-links.md",
    frontmatterComment: "markdown/frontmatter-comment.md",
  },
  yaml: {
    valid: "yaml/valid.yaml",
    duplicateKeys: "yaml/duplicate-keys.yaml",
  },
  toml: {
    valid: "toml/valid.toml",
    duplicateKeys: "toml/duplicate-keys.toml",
  },
  html: {
    valid: "html/valid.html",
    missingAlt: "html/missing-alt.html",
  },
  css: {
    valid: "css/valid.css",
    unknownProperty: "css/unknown-property.css",
  },
} as const;
