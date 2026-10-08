# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What This Is

`@askviraj/linter` is a **self-contained ESLint CLI** published to npm. It
bundles ESLint and all language plugins (JS/TS, Astro, JSON/JSONC, Markdown,
CSS, YAML, TOML, HTML) so consuming repos never install ESLint or plugins
themselves. At runtime, plugins resolve from this package's own `node_modules`,
not the target repo's.

| Language   | Files                                                          |
| ---------- | -------------------------------------------------------------- |
| JavaScript | `.js`, `.mjs`, `.cjs`, `.jsx`                                  |
| TypeScript | `.ts`, `.mts`, `.cts`, `.tsx`                                  |
| Astro      | `.astro`                                                       |
| JSON       | `.json`                                                        |
| JSONC      | `.jsonc`, `tsconfig.json`, `tsconfig.*.json`, `.vscode/*.json` |
| Markdown   | `.md` (frontmatter parsed as YAML)                             |
| CSS        | `.css` (with Tailwind CSS rules)                               |
| YAML       | `.yaml`, `.yml`                                                |
| TOML       | `.toml`                                                        |
| HTML       | `.html`                                                        |

This is enforced literally: every production dependency is listed in
`bundledDependencies`, so `npm pack`/`publish` ships the full resolved tree
**inside the tarball** (~36 MB). Consumers get exact, pre-resolved versions with
no install-time resolution — immune to transitive version drift, regardless of
their package manager. `typescript` is a real `dependency` (not just a
`typescript-eslint` peer) for the same reason — TS/Astro linting needs it
present in the bundle. Bundling requires `nodeLinker: hoisted`
(`pnpm-workspace.yaml`); pnpm refuses to bundle its default symlinked store.

Bundling a **native addon** needs one more thing. `astro-eslint-parser` loads
`@astrojs/compiler-binding`, whose per-platform `.node` binaries ship as
optional dependencies; pnpm installs only the host's binary by default, so a
tarball packed on CI bundled a linux-x64 binding that no other platform could
load and the CLI threw `Cannot find native binding` on import. The
`supportedArchitectures` block in `pnpm-workspace.yaml` forces every os/cpu/libc
combination to install, so all of them get bundled, and
`.github/scripts/check-bindings.sh` refuses a tarball missing any of them. It
skips `wasm32` (no `.node` file) and `android` (not in `supportedArchitectures`;
no CI runner can load it).

### Dependency policy

- Every dependency and devDependency is pinned to an **exact** version.
- `pnpm update --latest` excludes these packages. The exclusions are in
  `.config/mise/tasks/setup/pnpm/upgrade` and `deps-update.yml`. Keep the two
  lists the same.
  - `typescript`: hold at 6.x. `typescript-eslint` does not support 7.
  - `@eslint/css`: hold at 1.x. `@poupe/eslint-plugin-tailwindcss` needs
    `^1.1.0`. With 2.x, ESLint rejects every `css/*` rule.
- Advisories with no in-range fix are ignored in two places:
  `.config/osv-scanner.toml` (CI) and `auditConfig.ignoreGhsas` in
  `pnpm-workspace.yaml` (`pnpm audit`). The "Known Vulnerabilities" section of
  `readme.md` records each one. Keep the three in sync.

## Commands

Run mise tasks through `mise x --` so the correct toolchain is on PATH. Node and
pnpm come from `.config/mise.toml`. dprint, pre-commit, and taplo come from
`.config/mise.dev.toml`.

```bash
mise x -- mise run code:format --fix  # Format with dprint (without --fix: check only)
mise x -- mise run code:lint          # Self-lint via src/eslint.config.ts (--fix, --debug supported)
mise x -- mise run code:check         # tsc type-check (no emit)
mise x -- mise run code:precommit     # Run all pre-commit hooks on all files
mise x -- mise run p:build            # Compile src/ -> dist/
mise x -- mise run p:test             # Build, then run all tests (unit + integration)
mise x -- mise run p:test-unit        # Build, then run unit tests only
mise x -- mise run p:preflight        # Tests + pack + binding check + smoke.mjs (release.yml's Pack job, locally)
mise x -- mise run p:preview          # Run p:test, then pnpm pack
mise x -- mise run setup:all          # Bootstrap: clean install, upgrade deps, audit, AI plugins, pre-commit hooks
```

**WARNING:** `setup:all` deletes `node_modules/`, `dist/`, and `pnpm-lock.yaml`,
then upgrades every dependency to its latest version.

Direct equivalents that bypass mise:

```bash
pnpm run build                              # tsc -p tsconfig.build.json
pnpm run test                               # build + vitest run tests/unit
pnpm run test:integration                   # build + vitest run tests/integration
pnpm run test:all                           # build + vitest run tests
pnpx vitest run tests/unit/args.test.ts     # single test file
pnpx vitest run -t "test name"              # single test by name
```

**Tests require a build first** — every `test*` script runs `pnpm run build`
before vitest, because integration tests exec `dist/index.js`.

`pnpm pack` and `pnpm run build` can remove packages from `node_modules`. If a
tool is missing after them, run `pnpm install --frozen-lockfile`.

## Architecture

Two entry points, both backed by a shared base config:

- **`src/index.ts`** → `src/cli/runner.ts` — the published `bin`. Parses args,
  dispatches to `cli/commands/{help,version,init,lint}.ts`. `runLint` loads
  `.config/linter.yaml`, builds the config via `createConfig()`, and runs
  ESLint's programmatic API (`new ESLint()` with `overrideConfigFile: true` and
  `errorOnUnmatchedPattern: false`).
- **`src/auto.ts`** — the `@askviraj/linter/auto` export for the VS Code ESLint
  extension. Returns `createConfig(loadYamlOptions(process.cwd()))` as a default
  export.

Config composition pipeline:

1. **`src/config/presets/*.ts`** — one file per language; each exports an ESLint
   flat-config object with a `name` (e.g. `typescript`, `jsonc`). The `name` is
   the key users target in `overrides`.
2. **`src/config/index.ts`** — `composeBaseConfig()` orders all presets +
   `ignores` (`src/config/ignores.ts`) into one array via `defineConfig`.
3. **`src/eslint.config.ts`** — exports `composeBaseConfig()`; this is the
   config used for **self-linting** (`--config src/eslint.config.ts`).
4. **`src/config-loader.ts`** — `loadYamlOptions()` walks up from cwd to find
   `.config/linter.yaml`, validates the required `version` key, warns on unknown
   top-level keys.
5. **`src/config-factory.ts`** — `createConfig()` clones the base presets,
   merges per-preset `overrides.<name>.rules`, prepends `globalIgnores`, and
   appends raw user `configs`.

`src/config/ignores.ts` is part of the **published** config. Its patterns (for
example `**/AGENTS.md` and `.claude/**/*.md`) apply to every consumer repo.

### Adding a language or plugin

1. Add the plugin to `dependencies` **and to `bundledDependencies`**. A
   dependency that is not bundled does not reach consumers. If the plugin needs
   a runtime peer (like `typescript`), add that peer to both lists too.
2. Create a preset in `src/config/presets/` with a `name`, `files`, `plugins`
   and/or `extends`, and `language` / `languageOptions` as needed.
3. Register the preset in `composeBaseConfig()` (`src/config/index.ts`).
4. Add one `valid.*` fixture and at least one violating fixture under
   `tests/fixtures/<lang>/`, and list them in
   `tests/helpers/fixture-manifest.ts`.
5. Add the preset `name` to the preset list in this file and in `readme.md`.
6. If the plugin has a native binary, add its platform check to
   `.github/scripts/check-bindings.sh`.
7. Run `mise x -- mise run p:preflight`.

## CLI Reference

```bash
npx @askviraj/linter [flags] [files...]
bunx --bun @askviraj/linter [flags] [files...]
```

| Flag                      | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| `--init`                  | Scaffold `eslint.config.mjs`, `.config/linter.yaml`, and VS Code settings |
| `--force`                 | Overwrite existing files (with `--init`)                                  |
| `--fix`                   | Automatically fix problems                                                |
| `--cache`                 | Only check changed files                                                  |
| `--cache-location <path>` | Path to the cache file or directory                                       |
| `--no-ignore`             | Disable use of ignore files                                               |
| `--quiet`                 | Report errors only                                                        |
| `--debug`                 | Enable ESLint debug logging (`eslint:*,-eslint:code-path,eslintrc:*`)     |
| `--format`, `-f`          | Use a specific output format                                              |
| `--max-warnings <n>`      | Number of warnings to trigger nonzero exit code                           |
| `--version`, `-v`         | Show version and plugin versions                                          |
| `--help`, `-h`            | Show help                                                                 |
| positional args           | Files or directories to lint (default: `.`)                               |

`src/cli/args.ts` rejects unknown flags, so that they cannot conflict with the
built-in config. Use `--` before file names that start with `-`, for example
`linter -- --fix.js`.

## Consumer Configuration

`npx @askviraj/linter --init` scaffolds three files in the target repo:

- `eslint.config.mjs` — re-exports `@askviraj/linter/auto`, so the VS Code
  ESLint extension (`dbaeumer.vscode-eslint`) loads the same config as the CLI.
- `.config/linter.yaml` — the customization file.
- `.vscode/settings.json` — sets `eslint.useFlatConfig`. An existing file is
  edited with `jsonc-parser`, so its comments and trailing commas stay.

`.config/linter.yaml` example:

```yaml
version: 1
ignores:
  - "**/generated/**"

overrides:
  typescript:
    rules:
      "@typescript-eslint/no-explicit-any": "error"

configs:
  - name: "custom"
    files: [ "**/*.test.ts" ]
    rules: {}
```

| Key         | Type                        | Description                                                                       |
| ----------- | --------------------------- | --------------------------------------------------------------------------------- |
| `version`   | `number \| string`          | **Required.** Schema version (currently `1`).                                     |
| `ignores`   | `string[]`                  | Additional global ignore patterns (merged via `eslint/config`'s `globalIgnores`). |
| `overrides` | `Record<string, { rules }>` | Rule overrides keyed by preset name.                                              |
| `configs`   | `unknown[]`                 | Raw ESLint config objects appended after the base config.                         |

Preset names for `overrides`: `javascript`, `typescript`, `astro`, `json`,
`jsonc`, `markdown`, `markdown-typescript`, `yaml`, `toml`, `html`, `css`.

## Conventions

- **Flat config only** — never `.eslintrc`.
- **Formatter is dprint, not Prettier** — do not add Prettier config/ignore
  files. Remote WASM plugins (TOML through taplo via the `exec` plugin);
  `lineWidth` 80, `lf`, double quotes, 2-space indent, `onlyMultiLine` trailing
  commas. Import sorting is dprint's job — do not enable
  `source.organizeImports` in VS Code.
- **Strict TS**: `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `module: "Preserve"`,
  `moduleResolution: "bundler"`. Source imports use `.js` extensions.
- **`tests/` is excluded from linting/formatting** — it holds intentional error
  fixtures. Never run a bare `dprint fmt`; it reformats the fixtures. Use
  `code:format`, which excludes `tests/`.
- **VS Code in this repo**: the default formatter is `dprint.dprint`. ESLint
  gives diagnostics and fixes only (`eslint.format.enable: false`). Imports
  prefer non-relative specifiers.
- **Git**: do not commit without an explicit instruction from the user.
  Conventional commits (see `.config/git-conventional-commits.yaml`).
- **Pre-commit hooks** (`.config/pre-commit-config.yaml`, `pre-commit` and
  `commit-msg` stages): a git-config fix, the standard file checks,
  `sort-package-json`, `dprint fmt`, `eslint --config src/eslint.config.ts`,
  gitleaks (`.config/gitleaks.toml`), and conventional commits. The formatter
  and linter exclude `tests/`. The linter hook uses ESLint directly, not the
  built CLI, to avoid requiring a build before commit.

## Releasing

Publishing uses **npm OIDC trusted publishing** (no token, auto provenance) via
CI; pnpm is used for everything else. `release.yml` is the **only** workflow
that publishes — npm allows exactly one trusted publisher per package, so every
path routes through it.

It runs as four jobs: **pack** (test, `pnpm pack`, assert every platform's
native binding is in the tarball) → **verify-tarball** → **publish** →
**smoke-published**. The two matrix jobs run `.github/scripts/smoke.mjs` on one
runner per bundled native binary — the six GitHub-hosted os/arch combinations,
plus `node:24-alpine` containers for the two musl targets. The script installs
the build into a temp directory and lints `tests/fixtures/` with it, expecting
`valid.*` to report no errors and every other fixture to report a problem, so a
binary that fails to load surfaces as a failed job. `verify-tarball` gates the
publish; `smoke-published` re-checks what the registry actually serves. Dispatch
the workflow with **dry-run** to exercise both matrices without publishing.

The release paths into that pipeline:

- **Manual release**: `mise run p:release [--minor|--major]` runs `p:preflight`
  (tests, then the binding check and `smoke.mjs` against a locally packed
  tarball — the same scripts `release.yml` runs), bumps the version, commits
  `ops: release vX.Y.Z`, and creates a **signed** tag — it does *not* push. Then
  `git push && git push origin vX.Y.Z`; the tag push triggers
  `.github/workflows/release.yml`, which verifies tag == package.json version
  before running the pipeline above.
- **Monthly auto-update**: `.github/workflows/deps-update.yml` (cron + manual)
  runs `pnpm update --latest`, gates on `osv-scanner`, runs tests, then commits,
  bumps, annotated-tags, pushes, and hands off with
  `gh workflow run release.yml --ref vX.Y.Z`. A bot tag push can't trigger
  `release.yml`, but `workflow_dispatch` is a documented exception to that rule
  — it fires even from `GITHUB_TOKEN`. Dispatching against the **tag** ref keeps
  `release.yml`'s version check active. If no dependency changed, it stops and
  makes no release.
- **Local fallback**: `mise run p:publish [--dry-run]` (checks `npm whoami` →
  tests → builds → `npm publish`). Prefer CI so every version keeps the
  strongest npm trust level.

A tag whose release failed stays unpublished. Fix the problem and release the
next version. Do not move or delete a pushed tag.

CI sets `MISE_ENV=ci`, which layers `.config/mise.ci.toml` (provides
`osv-scanner`) on top of `.config/mise.toml`.

**npm Trusted Publisher config**: on npmjs.com, `@askviraj/linter` authorizes
repo `virajp/linter` with workflow `release.yml`. npm permits **one** trusted
publisher per package, so `deps-update.yml` can never publish directly — it
dispatches `release.yml` instead. Publishing from any other workflow fails the
OIDC token exchange with a misleading `404 ... package not found` / `ENEEDAUTH`.
If `main` is branch-protected, allow `github-actions[bot]` to push.

## Testing

- **Unit** (`tests/unit/`) — args parsing, preset shape, config factory, init
  scaffolding; helpers in `tests/helpers/run-unit.ts`.
- **Integration** (`tests/integration/`) — spawn `dist/index.js` against fixture
  files in a temp dir (`tests/helpers/{run-cli,temp-dir,fixture-manifest}.ts`),
  asserting on real lint output, flag behavior, and `--init` file creation.
- **Fixtures** (`tests/fixtures/<lang>/`) — one `valid.*` file and one or more
  violating files for each language. `smoke.mjs` treats only `valid.*` as clean,
  so a fixture that must lint clean belongs in the `valid.*` file. Do not give
  it another name.
