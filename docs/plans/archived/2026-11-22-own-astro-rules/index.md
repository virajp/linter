# Plan — Own the Astro rules and processor, and fix TypeScript in client scripts (2026-11-22)

## Goal

After this plan lands, the `astro` preset uses our own 18 `astro/` rules and
our own `astro/client-side-ts` processor from `src/plugins/astro/`, and
TypeScript in the client `<script>` of an `.astro` file parses and is
linted. `eslint-plugin-astro` is not a dependency. The deprecated rules and
the `jsx-a11y/*` wrappers are not ported.

This is plan 5 of 6 for backlog item B08. It requires plan 4,
`docs/plans/2026-11-22-own-html-rules`. There is no reversal of a standing
decision. The client-script fix (D6) is a behavior change that the user
asked for in this plan.

## Facts the survey established

**The current astro preset** (`src/config/presets/astro.ts`): `files:
["**/*.astro"]`, `plugins: { astro }`, `languageOptions` with the globals
`globals.node` and `globals.astro`, `parser: astro-eslint-parser`, and
`parserOptions: { parser: @typescript-eslint/parser, extraFileExtensions:
[".astro"], sourceType: "module" }`; `extends: [astro.configs.recommended]`;
`no-unreachable` off. The golden config snapshot of `file.astro` has the
processor `astro/client-side-ts`, the parser `astro-eslint-parser`, 9
`astro/` rules (all `error`) and `no-unreachable` off.

**The recommended config** (flat) has these entries: `astro/base/plugin`
(registers the plugin); `astro/base` (`files: ["*.astro", "**/*.astro"]`,
`languageOptions`, `processor: "astro/client-side-ts"`); `astro/base/javascript`
(`files: ["**/*.astro/*.js", "*.astro/*.js"]`, its own `languageOptions`,
`prettier/prettier` off); `astro/base/typescript` (`files:
["**/*.astro/*.ts", "*.astro/*.ts"]`, its own `languageOptions`,
`prettier/prettier` off); `astro/recommended` (the 9 rules).

**The bug** (checked on 2026-11-22 with `dist/index.js`, from a temp
directory outside the repo): a `.astro` file
with `const n = 1 as number;` in the frontmatter and
`document.querySelector("h1") as HTMLElement` in a client `<script>`
reports one fatal error, `7:43 Parsing error: Unexpected token as` — in the
script, not in the frontmatter. The consumer
`~/Projects/github.com/95octane/95octane/backend/.config/linter.yaml`
ignores `**/*.astro` because of it ("cannot parse TypeScript (for example
`as`) in the <script> of an .astro file").

**eslint-plugin-astro 3.2.1** (MIT, Copyright (c) 2022 Yosuke Ota,
`github.com/ota-meshi/eslint-plugin-astro`, tag `v3.2.1`, TypeScript):

- 20 native rules (`no-omitted-end-tags` and `valid-compile` are
  deprecated) and 36 `jsx-a11y/*` wrappers that need
  `eslint-plugin-jsx-a11y` (not installed).
- Processors: `.astro`, `astro`, `client-side-ts`.
- `src/`: `a11y/`, `configs/`, `environments/index.ts`,
  `esm-config-builder.ts`, `index.mts`, `meta.ts`, `plugin.ts`,
  `processor/` (`index.ts`, `astro/node.ts`, `astro/types.ts`), `rules/`,
  `shared/` (`index.ts`, `client-script/index.ts`,
  `client-script/parse-expression.ts`), `types-for-node.ts`, `types.ts`,
  `utils/` (`ast-utils`, `fix-tracker`, `index`, `resolve-parser/` — it
  requires `@typescript-eslint/parser` from the user's install —,
  `string-literal-parser/`, `style/`, `transform/` with
  `postcss-worker.mts` run through `synckit`, and `less`, `sass`,
  `stylus` transforms that load the user's preprocessor).
- Runtime imports: `astro-eslint-parser`, `globals`,
  `@eslint-community/eslint-utils`, `@typescript-eslint/types`, `postcss`,
  `postcss-selector-parser`, `synckit`, `espree`,
  `@jridgewell/sourcemap-codec`, `node:*`.
- Peers: `eslint >=10`; optional `typescript-eslint`,
  `@typescript-eslint/parser`, `eslint-plugin-jsx-a11y`,
  `eslint-plugin-jsx-a11y-x`.
- Tests: `tests/src/rules/<rule>.ts` (24), `tests/src/integration/` (13
  files), `tests/src/config/`, `tests/src/meta.ts`,
  `tests/src/utils/string-literal-parser/index.ts`, `tests/typing.test.ts`,
  `tests/integration/test.ts` (installs packages), `tests/utils/utils.ts`
  (the loader; write paths at lines 198 and 217) and
  `tests/utils/source-code-fixer.ts`. Fixtures: `tests/fixtures/rules/`
  (423 files, one directory per rule, plus `jsx-a11y/`) and
  `tests/fixtures/integration/` (13).
- Read a file with `gh api
  "repos/ota-meshi/eslint-plugin-astro/contents/<path>?ref=v3.2.1" --jq .content
  | base64 -d`.

**The packages:**

| Package                          | Installed              | Dependencies                                                                                                                                                          | Peers        |
| -------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `astro-eslint-parser`            | 3.2.0 (direct already) | `@astrojs/compiler-rs` (native binding), `@typescript-eslint/{scope-manager,types}`, `debug`, `eslint-scope`, `eslint-visitor-keys`, `espree`, `semver`, `tinyglobby` | none         |
| `postcss`                        | 8.5.33                 | `nanoid`, `picocolors`, `source-map-js`                                                                                                                               | none         |
| `postcss-selector-parser`        | 7.2.1                  | `util-deprecate`                                                                                                                                                      | none         |
| `synckit`                        | 0.11.13                | `@pkgr/core`, `@dual-bundle/import-meta-resolve`                                                                                                                      | none         |
| `@jridgewell/sourcemap-codec`    | 1.6.0                  | none                                                                                                                                                                  | none         |
| `@typescript-eslint/types`       | 8.73.0                 | none                                                                                                                                                                  | none         |
| `@eslint-community/eslint-utils` | 4.10.1                 | `eslint-visitor-keys ^3`                                                                                                                                              | `eslint >=8` |
| `espree`                         | 11.2.0                 | (ESLint depends on it)                                                                                                                                                | none         |

The versions are the ones that `pnpm-lock.yaml` resolves on 2026-11-22 (the
local `node_modules` of the planning checkout was stale).

**Consumers.** No `.config/linter.yaml` in `~/Projects` names an
`astro/` rule (scan of 2026-11-22). `95octane` ignores `**/*.astro`
(the bug); `claude-plugins` ignores its site's `.astro` files.

**From plans 1 to 4** (landed before this plan runs): `THIRD_PARTY_NOTICES.md`,
`src/plugins/{tailwindcss,yml,toml,html}/`, the test conventions, the
pre-commit exclude `^tests/(.*/)?fixtures/`.

**Gates and conventions** are those of plans 1 to 4.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file — the file a package
manager or a toolchain manager writes to pin what it resolved — with Write,
Edit, `sed` or a script: a lock file changes only as the output of the CLI
that owns it, the command the stack's package-manager conventions name, and
the unit keeps what that CLI wrote. A unit whose manifest change moves a lock
file lists that lock file in its `owns` beside the manifest.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A question is a point the plan does not decide and the
unit cannot settle inside its scope; the unit never proceeds on an
assumption.

A unit completes every edit that does not depend on an answer, never builds on
a part an answer can change, then returns all its open questions in one block.
Its edits stay uncommitted in the worktree. The orchestrator asks the user,
records each answer in `decisions`, and resumes the unit with the question ids
and answers; the resumed unit applies them and returns the whole block again.

## Out of scope

- B08 TypeScript (plan 6), which also decides `@typescript-eslint/parser`.
- The `jsx-a11y/*` wrappers and the deprecated rules (D2).
- Porting `astro-eslint-parser` or the small packages (D3).
- `tests/integration/test.ts` and its network installs (D5).

## Parked

- B08: TypeScript — own the `@typescript-eslint/` rules, and decide the
  TypeScript parser that the astro preset and the client-script configs use
  (plan 6 of B08).

- Not B08: after a release with this plan, remove the `**/*.astro` ignore
  and its comment from
  `~/Projects/github.com/95octane/95octane/backend/.config/linter.yaml`
  (another repo; D13 e).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-22-own-astro-rules

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
