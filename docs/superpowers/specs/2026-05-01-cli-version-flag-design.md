# Design: CLI Version Flags

## Goal

Add version-reporting flags to the `@virajp/linter` launcher so users can
quickly identify which versions of the wrapper, ESLint core, and all bundled
ESLint plugins and parsers are in use.

## Flags

| Flag        | Behavior                                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `--version` | Prints the package, ESLint core, and all ESLint-related dependency versions in multi-line format, then exits `0`. |
| `-v`        | Alias for `--version`.                                                                                            |

## Output Format

Multi-line. The first line is the CLI version prefixed with `v`, followed by a
line separator (`------`), then `eslint` core, then all remaining ESLint-related
dependencies in alphabetical order. Each entry after the separator is shown as
`<name> v<version>`.

Example:

```text
v1.0.3
------
eslint v9.x.x
@eslint/css v1.x.x
@eslint/js v1.x.x
@eslint/json v1.x.x
@eslint/markdown v1.x.x
@html-eslint/eslint-plugin v0.x.x
@poupe/eslint-plugin-tailwindcss v1.x.x
@typescript-eslint/parser v8.x.x
astro-eslint-parser v1.x.x
eslint-plugin-astro v1.x.x
eslint-plugin-toml v0.x.x
eslint-plugin-yml v1.x.x
typescript-eslint v8.x.x
```

The exact list depends on the dependencies declared in this package's
`package.json` at runtime.

## Implementation

In `src/index.ts`, after parsing `rawArgs` into `flags` and `positional`, check
whether `flags` contains `--version` or `-v` **before** assembling the ESLint
argument list.

If matched:

1. Resolve this package's `package.json` via `createRequire(import.meta.url)`.
2. Read its `version` field.
3. Read the `dependencies` object from the same `package.json`.
4. Filter to ESLint-related packages using the following name patterns:
   - `eslint*`
   - `@eslint/*`
   - `@typescript-eslint/*`
   - `typescript-eslint`
   - `@html-eslint/*`
   - `@poupe/eslint-plugin-*`
5. For each matched package, resolve its `package.json` via
   `createRequire(import.meta.url).resolve("<name>/package.json")` and read its
   `version`.
6. Print `v<version>` first (the CLI version on its own), then a separator line
   `------`, then `eslint v<version>`, then the remaining packages in
   alphabetical order, each on its own line.
7. Call `process.exit(0)`.

If no version flag is present, proceed with the existing ESLint spawn logic
unchanged.

## Files to Modify

| File           | Change                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `src/index.ts` | Add version-flag detection and multi-line version output construction. |

## Error Handling

If the package's own `package.json` cannot be read or lacks a `version` field,
print a concise error to `stderr` and exit with code `1`.

If an individual ESLint-related dependency cannot be resolved (e.g. missing from
`node_modules`), skip it and continue printing the rest. A missing bundled
dependency is a broken install, but partial version information is still useful.
