# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

> A detailed companion document exists at `AGENTS.md` — consult it for the full
> CLI reference, `.config/linter.yaml` schema, and VS Code integration details.

## What This Is

`@askviraj/linter` is a **self-contained ESLint CLI** published to npm. It
bundles ESLint and all language plugins (JS/TS, Astro, JSON/JSONC, Markdown,
CSS, YAML, TOML, HTML) so consuming repos never install ESLint or plugins
themselves. At runtime, plugins resolve from this package's own `node_modules`,
not the target repo's.

This is enforced literally: every production dependency is listed in
`bundledDependencies`, so `npm pack`/`publish` ships the full resolved tree
**inside the tarball** (~19 MB). Consumers get exact, pre-resolved versions with
no install-time resolution — immune to transitive version drift, regardless of
their package manager. `typescript` is a real `dependency` (not just a
`typescript-eslint` peer) for the same reason — TS/Astro linting needs it
present in the bundle. Bundling requires `nodeLinker: hoisted`
(`pnpm-workspace.yaml`); pnpm refuses to bundle its default symlinked store.

## Commands

Run mise tasks through `mise x --` so the correct toolchain (node, pnpm, dprint,
taplo) is on PATH:

```bash
mise x -- mise run code:format    # Format with dprint
mise x -- mise run code:lint      # Self-lint via src/eslint.config.ts (--fix, --debug supported)
mise x -- mise run code:check     # tsc type-check (no emit)
mise x -- mise run p:test         # Build, then run all tests (unit + integration)
mise x -- mise run p:build        # Compile src/ -> dist/
mise x -- mise run setup:all      # Bootstrap: install deps, pre-commit hooks, etc.
```

Direct equivalents that bypass mise:

```bash
pnpm run build                              # tsc -p tsconfig.build.json
pnpm run test                               # build + vitest run tests/unit
pnpm run test:integration                   # build + vitest run tests/integration
pnpx vitest run tests/unit/args.test.ts     # single test file
pnpx vitest run -t "test name"              # single test by name
```

**Tests require a build first** — every `test*` script runs `pnpm run build`
before vitest, because integration tests exec `dist/index.js`.

## Architecture

Two entry points, both backed by a shared base config:

- **`src/index.ts`** → `src/cli/runner.ts` — the published `bin`. Parses args,
  dispatches to `cli/commands/{help,version,init,lint}.ts`. `runLint` loads
  `.config/linter.yaml`, builds the config via `createConfig()`, and runs
  ESLint's programmatic API (`new ESLint()` with `overrideConfigFile: true`).
- **`src/auto.ts`** — the `@askviraj/linter/auto` export for the VS Code ESLint
  extension. Returns `createConfig(loadYamlOptions(process.cwd()))` as a default
  export.

Config composition pipeline:

1. **`src/config/presets/*.ts`** — one file per language; each exports an ESLint
   flat-config object with a `name` (e.g. `typescript`, `jsonc`). The `name` is
   the key users target in `overrides`.
2. **`src/config/index.ts`** — `composeBaseConfig()` orders all presets +
   `ignores` into one array via `defineConfig`.
3. **`src/eslint.config.ts`** — exports `composeBaseConfig()`; this is the
   config used for **self-linting** (`--config src/eslint.config.ts`).
4. **`src/config-loader.ts`** — `loadYamlOptions()` walks up from cwd to find
   `.config/linter.yaml`, validates the required `version` key, warns on unknown
   top-level keys.
5. **`src/config-factory.ts`** — `createConfig()` clones the base presets,
   merges per-preset `overrides.<name>.rules`, prepends `globalIgnores`, and
   appends raw user `configs`.

When **adding a language/plugin**: add the dep to `package.json` **and to
`bundledDependencies`** (otherwise it won't ship in the tarball), create a
preset in `src/config/presets/`, register it in `composeBaseConfig()`, and add
its `name` to the preset list in `AGENTS.md` / `readme.md`. If the plugin needs
a runtime peer (like `typescript`), add that to `dependencies` +
`bundledDependencies` too.

## Conventions

- **Flat config only** — never `.eslintrc`.
- **Formatter is dprint, not Prettier** — do not add Prettier config/ignore
  files. Remote WASM plugins; `lineWidth` 80, `lf`, double quotes, 2-space
  indent, `onlyMultiLine` trailing commas. Import sorting is dprint's job — do
  not enable `source.organizeImports` in VS Code.
- **Strict TS**: `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `module: "Preserve"`,
  `moduleResolution: "bundler"`. Source imports use `.js` extensions.
- **`tests/` is excluded from linting/formatting** — it holds intentional error
  fixtures (one valid + one violating file per language under
  `tests/fixtures/<lang>/`).
- Pre-commit hooks run `dprint fmt` and `eslint --config src/eslint.config.ts`
  (excluding `tests/`); gitleaks via `.config/gitleaks.toml`. The hook uses
  ESLint directly, not the built CLI, to avoid requiring a build before commit.
- Conventional commits (see `.config/git-conventional-commits.yaml`).

## Releasing

Publishing uses **npm OIDC trusted publishing** (no token, auto provenance) via
CI; pnpm is used for everything else. Two paths, both authorized publishers:

- **Manual release**: `mise run p:release [--minor|--major]` bumps the version,
  commits `ops: release vX.Y.Z`, and creates a **signed** tag — it does *not*
  push. Then `git push && git push origin vX.Y.Z`; the tag push triggers
  `.github/workflows/release.yml` (verifies tag == package.json version → tests
  → `npm publish` via OIDC).
- **Monthly auto-update**: `.github/workflows/deps-update.yml` (cron + manual)
  runs `pnpm update --latest`, gates on `osv-scanner`, runs tests, then commits,
  bumps, annotated-tags, pushes, and publishes inline (a bot tag push can't
  re-trigger `release.yml`).
- **Local fallback**: `mise run p:publish [--dry-run]` (checks `npm whoami` →
  tests → builds → `npm publish`). Prefer CI so every version keeps the
  strongest npm trust level.

CI sets `MISE_ENV=ci`, which layers `.config/mise.ci.toml` (provides
`osv-scanner`) on top of `.config/mise.toml`.

**One-time manual setup required**: configure the OIDC Trusted Publisher on
npmjs.com for `@askviraj/linter`, authorizing repo `virajp/linter` with both
`release.yml` and `deps-update.yml`. Until then, CI publishes fail. If `main` is
branch-protected, allow `github-actions[bot]` to push.

## Testing

- **Unit** (`tests/unit/`) — args parsing, preset shape, config factory, init
  scaffolding; helpers in `tests/helpers/run-unit.ts`.
- **Integration** (`tests/integration/`) — spawn `dist/index.js` against fixture
  files in a temp dir (`tests/helpers/{run-cli,temp-dir,fixture-manifest}.ts`),
  asserting on real lint output, flag behavior, and `--init` file creation.
