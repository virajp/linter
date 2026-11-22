# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What This Is

`@virajp.dev/linter` is a **self-contained ESLint CLI** published to npm. It
bundles ESLint and all language plugins (JS/TS, Astro, JSON/JSONC, Markdown,
CSS, YAML, TOML, HTML) so consuming repos never install ESLint or plugins
themselves. At runtime, third-party plugins resolve from this package's own
`node_modules`, not the target repo's. Our own plugins (see
[Our own plugins](#our-own-plugins)) are compiled into `dist/` with the CLI.

| Language   | Files                                                          |
| ---------- | -------------------------------------------------------------- |
| JavaScript | `.js`, `.mjs`, `.cjs`, `.jsx`                                  |
| TypeScript | `.ts`, `.mts`, `.cts`, `.tsx`                                  |
| Astro      | `.astro`                                                       |
| JSON       | `.json`                                                        |
| JSONC      | `.jsonc`, `tsconfig.json`, `tsconfig.*.json`, `.vscode/*.json` |
| Markdown   | `.md` (frontmatter parsed as YAML) and its fenced code blocks  |
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

The dependency criterion: a direct dependency is not a concern, because we
control its version. The problem is the transitive dependencies that each
direct dependency adds, above all the shared ones that cause version conflicts
between direct dependencies. Keep a direct dependency that has no peers and
whose transitive dependencies are none or already pinned. Port the code of a
package that brings peer ranges or a conflicting tree into
`src/plugins/<name>/`.

- Every dependency and devDependency is pinned to an **exact** version.
- `pnpm update --latest` excludes this package. The exclusions are in
  `.config/mise/tasks/p/upgrade.py` (`p:upgrade`) and `deps-update.yml`. Keep
  the
  two
  lists the same.
  - `typescript`: hold at 6.x. `typescript-eslint` does not support 7.
- Advisories with no in-range fix are ignored in three places:
  `.config/osv-scanner.toml` (CI), `.config/grype.yaml` (`code:sec`), and
  `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml` (`pnpm audit`). The
  "Known Vulnerabilities" section of `readme.md` records each one. Keep the
  four in sync.

## Commands

Run mise tasks through `mise x --` so the correct toolchain is on PATH. The
`bootstrap` sync supplies the tools and the shared tasks (`code:*`, `setup*`,
`git:*`): the values are in `.config/bootstrap/`, and `mise run setup:configs`
syncs them. The tools are in `.config/mise/conf.d/<tool>/mise.<env>.toml`. The
own mise config of this repository is in `.config/mise/conf.d/zz-repo/`.

```bash
mise x -- mise run code:format --fix # Format the uncommitted files (--all: every file; without --fix: check only)
mise x -- mise run code:lint         # Lint: the published linter, then the self-lint via src/eslint.config.ts (code:lint:10-self)
mise x -- mise run code:check        # tsc type-check (no emit)
mise x -- mise run code:precommit    # Run the pre-commit hooks on the uncommitted files (--all: every file)
mise x -- mise run p:build           # Compile src/ -> dist/
mise x -- mise run p:test            # Build, then run all tests (unit + integration)
mise x -- mise run p:test-unit       # Build, then run unit tests only
mise x -- mise run test:golden       # Build, then compare with the golden snapshots (--update: write them again)
mise x -- mise run p:preflight       # Tests + pack + binding check + smoke.mjs (release.yml's Pack job, locally)
mise x -- mise run p:preview         # Run p:test, then pnpm pack
mise x -- mise run p:upgrade         # Upgrade the dependencies to latest, with the holds of the dependency policy
mise x -- mise run setup             # Install the tools, the dependencies, the hooks and the AI plugins
```

Direct equivalents that bypass mise:

```bash
pnpm run build                          # tsc -p tsconfig.build.json
pnpm run test                           # build + vitest run tests/unit
pnpm run test:integration               # build + vitest run tests/integration
pnpm run test:all                       # build + vitest run tests
pnpx vitest run tests/unit/args.test.ts # single test file
pnpx vitest run -t "test name"          # single test by name
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
- **`src/auto.ts`** — the `@virajp.dev/linter/auto` export for the VS Code
  ESLint extension. Returns `createConfig(loadYamlOptions(process.cwd()))` as a
  default export.

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

**Markdown code blocks need a second ESLint run.** With a processor, ESLint
lints only the extracted code blocks, not the Markdown content. So
`src/config/markdown-processor.ts` is not in the base config. `runLint` lints
all targets with the base config, then lints the `.md` files again with the
processor added, and merges each file's two results. The second run has no
cache. Each block uses the preset of its language (a virtual file such as
`doc.md/0.ts`), and the `markdown-code-blocks` preset relaxes the JS/TS rules.
The `/auto` export has one config, so the VS Code extension shows Markdown
content problems only.

`src/config/ignores.ts` is part of the **published** config. Its patterns (for
example `**/AGENTS.md` and `.claude/**/*.md`) apply to every consumer repo.

### Our own plugins

B08 moves the rules of third-party plugins into this package. Today the
Tailwind rules and the YAML rules and language are moved. Each plugin is in
`src/plugins/<name>/` and compiles into `dist/` with the rest of `src/`. Its
rules keep the rule names of the plugin they replace, so consumer `overrides`
do not change.

- **`src/plugins/tailwindcss/`** — the `tailwindcss/` rules of the `css`
  preset (`index.ts`, `syntax.ts`, `types.ts`, `utils/`, `rules/`). The
  rules are ported from the third-party plugin that `THIRD_PARTY_NOTICES.md`
  names, without the Vue-only rule `require-reference-in-vue`. The plugin
  exports `meta` and `rules` only: the `css` preset sets the rule severities
  and options. The preset uses the `css/css` language of `@eslint/css`, with
  the Tailwind 4 syntax of `syntax.ts` as `customSyntax` and `tolerant: true`.
- **`src/plugins/yml/`** — the `yml/` rules and the `yml/yaml` language of the
  `yaml` preset (`index.ts`, `meta.ts`, `types.ts`, `language/`, `utils/`,
  `rules/`). The rules and the language are ported from
  `eslint-plugin-yml`, which is not a dependency now. The Vue-only rule
  `vue-custom-block/no-parsing-error` is not ported. The plugin exports
  `meta`, `rules` and `languages` (`yaml`): the `yaml` preset sets the
  language and the rule severities. The language parses with
  `yaml-eslint-parser`.
- A ported file starts with a one-line header that names its source. Each
  source has an entry with its license text and copyright in
  `THIRD_PARTY_NOTICES.md`, which `files` of `package.json` ships in the
  tarball.
- Type-only imports come from the exact-pinned devDependencies `@eslint/core`
  and `@eslint/css-tree` (`import type` only), so `tsc` does not depend on how
  pnpm hoists a transitive package. They add nothing to the tarball.
- The `yml` plugin also has runtime dependencies: `yaml-eslint-parser`,
  `@eslint/plugin-kit`, `@ota-meshi/ast-token-store`, `natural-compare`,
  `diff-sequences` and `escape-string-regexp`. Each one is an exact-pinned
  dependency in `bundledDependencies` (see the dependency criterion in
  [Dependency policy](#dependency-policy)). `natural-compare` has no types,
  so `src/plugins/yml/natural-compare.d.ts` declares its module.

### Adding a language or plugin

1. Write the rules in `src/plugins/<name>/` (see
   [Our own plugins](#our-own-plugins)). Do not add a new third-party plugin.
   A file ported from another project gets a one-line source header and an
   entry in `THIRD_PARTY_NOTICES.md`. If a runtime package is necessary (a
   package that meets the dependency criterion of
   [Dependency policy](#dependency-policy), or a peer like `typescript`), add
   it to `dependencies` **and to `bundledDependencies`**. A dependency that is
   not bundled does not reach consumers.
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
npx @virajp.dev/linter [flags] [files...]
bunx --bun @virajp.dev/linter [flags] [files...]
```

| Flag                      | Description                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `--init`                  | Scaffold `eslint.config.mjs` and `.config/linter.yaml`; update `.vscode/settings.json` if it exists |
| `--force`                 | Overwrite `eslint.config.mjs` and `.config/linter.yaml` (with `--init`)                             |
| `--fix`                   | Automatically fix problems                                                                          |
| `--cache`                 | Only check changed files                                                                            |
| `--cache-location <path>` | Path to the cache file or directory                                                                 |
| `--no-ignore`             | Disable use of ignore files, the built-in ignore list, and `ignores` of `.config/linter.yaml`       |
| `--quiet`                 | Report errors only                                                                                  |
| `--debug`                 | Enable ESLint debug logging (`eslint:*,-eslint:code-path,eslintrc:*`)                               |
| `--format`, `-f`          | Use a specific output format                                                                        |
| `--max-warnings <n>`      | Number of warnings to trigger nonzero exit code                                                     |
| `--version`, `-v`         | Show version and plugin versions                                                                    |
| `--help`, `-h`            | Show help                                                                                           |
| positional args           | Files or directories to lint (default: `.`)                                                         |

`src/cli/args.ts` rejects unknown flags, so that they cannot conflict with the
built-in config. Use `--` before file names that start with `-`, for example
`linter -- --fix.js`.

## Consumer Configuration

`npx @virajp.dev/linter --init` scaffolds two files in the target repo and
edits one file only if it exists:

- `eslint.config.mjs` — re-exports `@virajp.dev/linter/auto`, so the VS Code
  ESLint extension (`dbaeumer.vscode-eslint`) loads the same config as the CLI.
- `.config/linter.yaml` — the customization file.
- `.vscode/settings.json` — sets `eslint.useFlatConfig`. `--init` edits the file
  with `jsonc-parser`, so its comments and trailing commas stay. If the file
  does not exist, `--init` does not create it (or `.vscode/`) and reports
  `[skipped]`. If the file has no JSON root or has a JSONC syntax error,
  `--init` does not write it, reports `[failed]`, and exits 1. A leading UTF-8
  BOM is not an error: the file is merged and the BOM stays. `--force` does not
  change this step, and the `--force` hint does not count a skipped settings
  file.

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
`jsonc`, `markdown`, `markdown-code-blocks`, `yaml`, `toml`, `html`, `css`.

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

The publish job skips `npm publish` only when a `workflow_dispatch` sets the
input **skip-publish** to `true` and `npm view <name>@<version>` returns that
version. Then `smoke-published` tests the version that is already on npm. Use
this input after the first version of a new package name is published by hand
(npm cannot add a Trusted Publisher to a package that does not exist). A tag
push never skips the publish. A dispatch with `skip-publish: true` for a
version that is not on npm fails.

The release paths into that pipeline:

- **Manual release**: the table `[release.linter.prod]` of
  `.config/bootstrap/repo.toml` defines it, and bootstrap ships the task
  `release:linter:prod`. Set the level in the change that the release ships:
  `mise x -- bootstrap config set releases.linter PATCH` (or `MINOR`,
  `MAJOR`), and land `.config/bootstrap/releases.toml` on `main` with that
  change. The task refuses a dirty tree. Then, on a clean `main`,
  `mise run release:linter:prod --push` runs `p:preflight`
  (tests, then the binding check and `smoke.mjs` against a locally packed
  tarball — the same scripts `release.yml` runs), bumps `package.json`,
  commits `ops: release vX.Y.Z` with the cleared level on the local branch
  `release/vX.Y.Z`, lands it with `git:merge:main` (which pushes `main`),
  creates a **signed** tag on the merge commit, pushes the tag and watches
  `release.yml`. Without `--push`, it prints the push command. The tag push
  triggers `.github/workflows/release.yml`, which verifies tag == package.json
  version before running the pipeline above.
- **Weekly auto-update**: `.github/workflows/deps-update.yml` runs each Monday
  at 02:00 UTC, and on a manual dispatch. If no dependency changed, it stops
  and makes no release. Else it does these steps:
  1. It runs `pnpm update --latest` with the holds, and `osv-scanner`.
  2. It writes the golden snapshots again (`vitest run tests/golden --update`),
     so a changed rule, problem or fix is accepted and shows in the commit
     diff.
  3. It runs all the tests, packs the tarball, and runs `check-bindings.sh`
     and `smoke.mjs` on it.
  4. It commits `ops(deps): weekly dependency update`.
  5. It does the steps of `release:linter:prod`, because CI has no `bootstrap`
     binary for Linux and no signing key. The level is `releases.linter`, and
     NONE gives PATCH. It bumps `package.json`, clears the level, and commits
     `ops: release vX.Y.Z`. It makes an annotated tag that is **not signed**.
  6. It pushes `main` and the tag in one atomic push, and starts `release.yml`
     with `gh workflow run release.yml --ref vX.Y.Z`.

  A tag that `GITHUB_TOKEN` pushes does not start `release.yml`, but a
  `workflow_dispatch` does. A dispatch on the **tag** ref keeps the version
  check of `release.yml` active.
- **Local fallback**: `mise run p:publish [--dry-run]` (checks `npm whoami` →
  tests → builds → `npm publish`). Prefer CI so every version keeps the
  strongest npm trust level.

A tag whose release failed stays unpublished. Fix the problem and release the
next version. Do not move or delete a pushed tag.

CI sets `MISE_ENV=ci`, which layers `.config/mise.ci.toml` (provides
`osv-scanner`) on top of `.config/mise.toml`.

**npm Trusted Publisher config**: on npmjs.com, `@virajp.dev/linter` authorizes
repo `virajp/linter` with workflow `release.yml`. npm permits **one** trusted
publisher per package, so `deps-update.yml` can never publish directly — it
dispatches `release.yml` instead. Publishing from any other workflow fails the
OIDC token exchange with a misleading `404 ... package not found` / `ENEEDAUTH`.
If `main` is branch-protected, allow `github-actions[bot]` to push.

## Testing

- **Unit** (`tests/unit/`) — args parsing, preset shape, config factory, init
  scaffolding; helpers in `tests/helpers/run-unit.ts`.
  `tests/unit/plugins/<name>/` has the tests of our own plugins: a RuleTester
  test for each rule (`rules/<rule>.test.ts`, or `rules/<group>/<rule>.test.ts`
  for `yml`), and tests of the language, the syntax and the helpers. A plugin
  can keep the upstream fixtures of its ported tests in
  `tests/unit/plugins/<name>/fixtures/`, with the upstream fixture loader in
  `helpers/` (for `yml`, `fixtures/rules/` and the copy
  `fixtures/upstream-package.json`). The global `exclude` of
  `.config/pre-commit-config.yaml` is `^tests/(.*/)?fixtures/`, so the hooks
  do not change these fixtures or `tests/fixtures/`. Change it in
  `.config/bootstrap/tools.toml` too, so that a bootstrap sync keeps it.
- **Integration** (`tests/integration/`) — spawn `dist/index.js` against fixture
  files in a temp dir (`tests/helpers/{run-cli,temp-dir,fixture-manifest}.ts`),
  asserting on real lint output, flag behavior, and `--init` file creation.
- **Golden** (`tests/golden/`) — snapshots of what the shipped config does, in
  `tests/golden/__snapshots__/`. `config/` has the language, the parser, the
  processor and every rule with its severity and options for each file type.
  `lint/problems.json` has each problem of each fixture, and `lint/fixes.json`
  has each fixture that `--fix` changes. The same file also makes sure that
  the CLI writes nothing to stderr and uses no deprecated rule. A dependency
  update that changes a rule, a problem or a fix fails these tests. Examine
  the diff, then run `mise x -- mise run test:golden --update` and commit the
  snapshots. `p:test` runs them too.
- **Peers** (`tests/unit/peers.test.ts`) — runs `pnpm peers check`. Each peer
  mismatch must be in its `ALLOWED` list, and each entry of the list must still
  match. Remove an entry when its mismatch is gone.
- **`/auto`** (`tests/integration/auto-export.test.ts`) — loads `dist/auto.js`
  through `eslint.config.mjs` with the ESLint API, as the VS Code extension
  does.
- **Fixtures** (`tests/fixtures/<lang>/`) — one `valid.*` file and one or more
  violating files for each language. `smoke.mjs` treats only `valid.*` as clean,
  so a fixture that must lint clean belongs in the `valid.*` file. Do not give
  it another name. The `valid.*` files use modern syntax of their language, so
  that a parser regression shows. Add new syntax there.

## vwf workflow

This repo uses the **vwf** Product → Blueprint → Plan → Execute workflow. Docs
live under `docs/blueprint/` (the desired state) and `docs/plans/` (one folder
per plan — the diffs to apply, and the ad-hoc changes).

**Order:** `/vwf:setup` → `/vwf:product` → `/vwf:architecture` →
`/vwf:design-system` (once a UI exists) → `/vwf:blueprint` (a full-product sweep
— `plan` halts until its coverage stamp reads complete) → `/vwf:plan <slice>` →
`/vwf:execute <folder>` (or `next`, or `all` for every runnable plan, each in
its own runner) — a landed plan is archived by the run, and a folder left live
is archived by asking — then, after you deploy, `/vwf:verify <env>`
and `/vwf:feedback` route what production says back into
product/blueprint/plan.

Blueprint flow passes render each flow's screens (happy & sad paths) into the
gitignored `docs/scratchpad/` tree — one connected site per platform, on the
production routes — reviewed at the local URL the pass prints before it is
approved — mockups are realizations for review, never part of the
contract, and are never pushed to the design tool. Design-first instead:
`/vwf:screens prompt <flow>` writes a brief you paste into the canvas chat (one
interactive page per platform, named `<flow>--<platform>`),
`/vwf:screens
import` folds the designs back through blueprint passes.
`/vwf:mockups [flow]` batch re-renders (e.g. after a design-system change);
`/vwf:feedback canvas` harvests the canvas review conversation back into the
contracts (as routed intent, never as files).

**The blueprint is a code-independent contract.** It records only decisions that
have more than one reasonable answer *and* are true regardless of how the code
is written today. Reuse-vs-build, file placement, step ordering, and library
choices are `plan`'s job — not the blueprint's.

**Docs:**

- `docs/blueprint/product.md` — problem, users, measurable goals (every flow
  `Serves:` one; entities trace through flows), slice priority.
- `docs/blueprint/architecture.md` — system shape + machine-readable Project
  Registry.
- `docs/blueprint/design-system.md` — product-wide UX/visual contract (if UI).
- `docs/blueprint/conventions.md` — cross-cutting decisions (auth, errors, ids,
  config…).
- `docs/blueprint/environment.md` — per-project inventory of env vars + secrets,
  no values (if the system has an external integration/secret).
- `docs/blueprint/flows/<project>/<NNN>-<flow>/` — one folder per flow, the
  **primary** blueprint unit: `index.md` carries the platform-agnostic contract
  (trigger, actors, steps, jobs, acceptance) and one `<platform>.md` per
  implemented platform (`mobile` / `tablet` / `desktop` / `auto` / `watch` /
  `tv` / `spatial` / `site` / `webapp`)
  carries that platform's screens, each row with its frame code. Numbers are
  designated — `100` is always `home`. `flows/index.md` holds the catalog +
  inter-service contracts.
- `docs/blueprint/entities/<entity>/` — one folder per entity, the supporting
  data contracts: `index.md` (lifecycle, relationships, invariants) +
  `schema.yaml` (the authoritative data model). `entities/index.md` holds the
  catalog + product-wide ER diagram.
- `docs/blueprint/apis/<project>.openapi.yaml` — the authoritative API contract
  per service project; `apis/released/` holds the frozen production snapshots
  (backward compatibility is enforced against the latest one). The blueprint
  root holds only the system docs above.

**The blueprint is an OKF bundle.** `docs/blueprint/` is an Open Knowledge
Format (OKF) v0.1 bundle — every doc is a typed concept (YAML frontmatter) and
relationships are markdown links. So it is portable: any OKF-aware tool (e.g.
the OKF static-HTML graph visualizer) can render it — no vwf-specific reader
required.

Re-run `/vwf:setup` after upgrading vwf to migrate the docs to the latest
format.
