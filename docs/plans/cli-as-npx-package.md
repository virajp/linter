# Plan: Turn `@virajp/linter-cli` into a Distributable CLI

## Goal

Make `@virajp/linter-cli` runnable as a self-contained CLI via:

- `bunx --bun @virajp/linter-cli`
- `npx @virajp/linter-cli`

When executed from any repo, it should lint files in the **current working
directory** using the bundled ESLint config (`src/eslint.config.ts`) and bundled
plugins — so users don't have to install ESLint or any plugins in their own
repos.

## Problem

The package currently only exports a config file. There is no CLI entry point,
no `bin` field, and no build step. When installed in a target repo, users would
still need to wire up ESLint themselves.

## Approach: Compiled ESM CLI + ESLint Subprocess

**Why subprocess instead of the ESLint API?**

- Full, automatic compatibility with all ESLint CLI flags (`--fix`, `--quiet`,
  `--debug`, `--cache`, etc.) without building a custom argument parser.
- Simpler, more maintainable, and future-proof as ESLint evolves.

**Why compiled JS instead of shipping raw TypeScript?**

- Node cannot execute `.ts` natively. Bun can, but we want a single entry point
  that works for both runtimes.
- Shipping a pre-built `dist/` directory as ESM works for both `node` and `bun`.

**How plugin resolution works:**

- The bundled config (`dist/eslint.config.js`) imports plugins via bare
  specifiers (`@eslint/css`, `typescript-eslint`, etc.).
- Node module resolution starts from the config file's directory (inside the
  installed `@virajp/linter-cli` package), so it finds the plugins in the
  package's own `node_modules/`. This is exactly what we want — the target repo
  does not need these installed.

## Implementation Steps

### 1. Add `typescript` as a devDependency

The project currently uses Bun + TS but does not explicitly list `typescript`.
We need `tsc` for the build step.

### 2. Create `tsconfig.build.json`

The root `tsconfig.json` has `noEmit: true` and
`allowImportingTsExtensions: true`, which prevents `tsc` from emitting JS. We
need a separate build config that:

- Extends `tsconfig.json`
- Sets `noEmit: false`
- Sets `outDir: "./dist"`
- Removes `allowImportingTsExtensions`
- Keeps `module: "Preserve"` or switches to `NodeNext` for ESM output

### 3. Write `src/index.ts` (CLI entry point)

A thin launcher that:

1. Uses `createRequire` + `require.resolve("eslint/bin/eslint.js")` to find the
   bundled ESLint binary.
2. Resolves the bundled config path (`dist/eslint.config.js`, relative to the
   current file).
3. Parses `process.argv.slice(2)`:
   - Passes all flags through as-is.
   - If no positional file arguments are provided, defaults to `.` (the cwd).
4. Spawns the ESLint subprocess with:
   - `--no-config-lookup` (forces use of our bundled config, ignores any local
     `eslint.config.js`)
   - `--config <bundled-config-path>`
   - `--pass-on-no-patterns`
   - `--exit-on-fatal-error`
   - `--no-error-on-unmatched-pattern`
   - All user-supplied args
   - The resolved file globs
5. Sets `stdio: "inherit"` and `cwd: process.cwd()` so output and file
   resolution happen in the target repo.
6. Exits with the same code as ESLint.

### 4. Update `package.json`

- Add `"type": "module"` to treat `.js` files as ESM.
- Add `"bin": { "@virajp/linter-cli": "dist/index.js" }` so `npx`/`bunx` know
  what to run.
- Add `"files": ["dist/", "src/"]` so npm publishes the compiled JS (and
  optionally the TS source).
- Add
  `"scripts": { "build": "tsc -p tsconfig.build.json", "prepublishOnly": "bun run build" }`.
- Add `typescript` to `devDependencies`.

### 5. Build and verify

- Run `bun run build` to populate `dist/`.
- Create a temp directory with some JS/TS files.
- From that temp directory, run:
  - `node <path-to-repo>/dist/index.js`
  - `bun <path-to-repo>/dist/index.js`
- Verify it lints using the bundled config and plugins, not any local setup.

## Files to Create / Modify

| File                  | Action                                                                  |
| --------------------- | ----------------------------------------------------------------------- |
| `src/index.ts`        | **Create** — CLI launcher                                               |
| `tsconfig.build.json` | **Create** — build-only TS config                                       |
| `package.json`        | **Modify** — add `bin`, `files`, `type`, `scripts`, `typescript` devDep |
| `AGENTS.md`           | **Modify** — update with CLI usage info after implementation            |

## Future Enhancements (out of scope for this plan)

- Add a `format` subcommand that invokes `dprint` using the bundled
  `dprint.json`.
- Export the config separately via `exports` field so consumers can
  `import config from "@virajp/linter-cli/config"`.
- Add `--version` and `--help` flags in the launcher.
