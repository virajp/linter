# Plan — Own the TypeScript rules (2026-11-22)

## Goal

After this plan lands, the `typescript` preset uses our own 128
`@typescript-eslint/` rules from `src/plugins/typescript/`.
`typescript-eslint` and `@typescript-eslint/eslint-plugin` are not
dependencies. `@typescript-eslint/parser` stays, and so does the
`typescript` 6.x hold, until upstream supports TypeScript 7. The 9
deprecated rules are not ported.

This is plan 6 of 6 for backlog item B08, and it finishes B08. It requires
plan 5, `docs/plans/2026-11-22-own-astro-rules`. There is no reversal of a
standing decision.

## Facts the survey established

**The current typescript preset** (`src/config/presets/typescript.ts`):
`files: ["**/*.{ts,mts,cts,tsx}"]`, `extends: [js.configs.recommended,
tseslint.configs.recommended]`, the globals `browser` and `node`,
`plugins: { js, tseslint }`, and the overrides
`@typescript-eslint/no-empty-object-type`, `no-explicit-any`,
`no-this-alias`, `no-unsafe-function-type` (off), `no-unused-vars` (error
with `argsIgnorePattern` and `varsIgnorePattern` `^(_.*|.*Schema)$`), and
`require-yield` (off). No type information is set. The golden snapshots of
`.ts`, `.tsx`, `.mts` and `.cts` have 20 `@typescript-eslint/` rules (14
error, 2 error with options, 4 off) and 71 core rules.
`tseslint.configs.recommended` has three entries: `base` (parser and plugin),
`eslint-recommended` (23 core-rule overrides for TypeScript files) and
`recommended` (the rules).

**Other users of the packages:** `src/config/presets/astro.ts` imports
`@typescript-eslint/parser` (unchanged by this plan);
`src/config/presets/markdown-code-blocks.ts` turns off three
`@typescript-eslint/` rules by name (unchanged).

**@typescript-eslint/eslint-plugin 8.73.0** (MIT, Copyright (c) 2019
typescript-eslint and other contributors, monorepo
`github.com/typescript-eslint/typescript-eslint`, tag `v8.73.0`, package
path `packages/eslint-plugin/`):

- 137 rules: 64 need type information (with
  `no-unsafe-class-instance-assignment`,
  new in 8.73.0), 9 are deprecated, 64 are neither. (The planning checkout's
  `node_modules` held a stale 8.72.1 with 136.)
- `src/`: `rules/` (one file per rule, plus `enum-utils/`,
  `naming-convention-utils/` (8 files), `prefer-optional-chain-utils/` (5
  files)), `util/` (57 files, with `class-scope-analyzer/`), `configs/`,
  `index.ts`, `raw-plugin.ts`.
- Runtime imports (in the built `dist/`): `@typescript-eslint/utils` (158,
  plus `/ast-utils` and `/eslint-utils`), `ts-api-utils` (62),
  `typescript` (58), `@typescript-eslint/scope-manager` (14),
  `@typescript-eslint/type-utils` (8), `@typescript-eslint/visitor-keys`,
  `@eslint-community/regexpp`, `natural-compare`, `ignore` (only
  `no-restricted-imports`, deprecated), `eslint/use-at-your-own-risk`,
  `@typescript-eslint/parser`.
- Tests (`packages/eslint-plugin/tests/`): `rules/<rule>.test.ts`, with
  folders for `class-methods-use-this` (2), `member-ordering` (5),
  `naming-convention` (18), `no-shadow` (2), `no-unused-vars` (3),
  `prefer-optional-chain` (14); `RuleTester.ts` (fixture helpers);
  `fixtures/` (40 files: tsconfig projects); `util.test.ts`, `util/` (8
  test files), `rules/index.test.ts`,
  `schemas.test.ts`, `configs.test.ts`, `index.test.ts`,
  `areOptionsValid*`, `docs.test.mts`, `docs-eslint-output-snapshots/`,
  `eslint-rules/`, `worksWithStringlyTypedExtends.test.ts`. The rule tests
  import `RuleTester` from `@typescript-eslint/rule-tester`.
- Read a file with `gh api
  "repos/typescript-eslint/typescript-eslint/contents/packages/eslint-plugin/<path>?ref=v8.73.0"
  --jq .content | base64 -d`.

**The peers.** Every typescript-eslint package (`typescript-eslint`,
`parser`, `eslint-plugin`, `typescript-estree`, `utils`, `type-utils`,
`project-service`, `tsconfig-utils`, `rule-tester`) has the peer
`typescript >=4.8.4 <6.1.0`; `typescript-estree` 8.73.0 also has an optional
peer `@typescript/native`. `ts-api-utils` 2.5.0 has the peer
`typescript >=4.8.4`. `scope-manager`, `types` and `visitor-keys` have no
peers. TypeScript 7.0.2 (npm `latest`) exports only `unstable/*` API
entries. `typescript-estree` depends on `minimatch ^11.0.1`.

**Consumers.** 11 `.config/linter.yaml` files in `~/Projects` override
`@typescript-eslint/no-explicit-any`; none names another
`@typescript-eslint/` rule (scan of 2026-11-22).

**Holds.** `.config/mise/tasks/p/upgrade.py` and
`.github/workflows/deps-update.yml` hold `typescript` with a comment that
names `typescript-eslint`; `CLAUDE.md` "Dependency policy" says the same.

**From plans 1 to 5** (landed before this plan runs): the conventions of
`src/plugins/<name>/` and `tests/unit/plugins/<name>/`,
`THIRD_PARTY_NOTICES.md`, the pre-commit exclude `^tests/(.*/)?fixtures/`.

**Gates and conventions** are those of plans 1 to 5.

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

- TypeScript 7, and the `typescript` 6.x hold (D2).
- Porting `@typescript-eslint/parser`, `typescript-estree` or the utils
  packages (D2, D4).
- The 9 deprecated rules (D3).
- Turning on type information in the preset.

## Parked

none

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-22-own-typescript-rules

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
