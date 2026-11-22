# Plan — Own the Tailwind CSS rules and upgrade @eslint/css to 2.x (2026-11-22)

## Goal

After this plan lands, the `css` preset uses our own Tailwind rules from
`src/plugins/tailwindcss/`, on `@eslint/css` 2.0.1.
`@poupe/eslint-plugin-tailwindcss` is not a dependency, and the hold on
`@eslint/css` is gone from `upgrade.py` and `deps-update.yml`.

This is plan 1 of 6 for backlog item B08, "Own the third-party ESLint plugin
rules; keep only ESLint core packages". The user decided the direction on
2026-11-08 and gave two rules for this work: the least amount of
dependencies, and a strong justification for each dependency that stays.
There is no reversal of a standing decision.

## Facts the survey established

**The current css preset** (`src/config/presets/css.ts`) extends
`css.configs.recommended` and `tailwindcss.configs["recommended"]` from
`@poupe/eslint-plugin-tailwindcss` 0.3.1, and turns off
`css/no-invalid-at-rules`. The resolved config for `.css` files
(`tests/golden/__snapshots__/config/file.css.json`) has the language
`tailwindcss/css`, 11 `css/` rules and 15 `tailwindcss/` rules.

**The 15 enabled `tailwindcss/` rules:**

- Warn: `no-arbitrary-value-overuse`, `no-important`, `prefer-theme-tokens`.
- Error: `no-conflicting-utilities`, `no-duplicate-imports`,
  `no-duplicate-reference`, `no-empty-blocks`, `no-invalid-at-rules`,
  `no-invalid-named-grid-areas`, `no-invalid-properties`,
  `require-reference-in-vue`, `use-baseline`, `valid-apply-directive`,
  `valid-modifier-syntax`, `valid-theme-function`.
- Not enabled: `consistent-spacing` (fixable, whitespace),
  `prefer-logical-properties` (suggestions), `relative-font-units`,
  `use-layers`.

**The plugin internals:**

- The `tailwindcss/css` language is only `new CSSLanguage()` from
  `@eslint/css`. Tailwind support comes from the language options
  `customSyntax` (the `tailwind4` syntax of `tailwind-csstree`, plus a
  `@tailwind` at-rule prelude) and `tolerant: true`.
- The rules walk the CSSTree AST through `context.sourceCode`. They use no
  parser services and no type information. Several rules wrap rules of
  `@eslint/css` (`src/utils/css.ts` upstream imports `@eslint/css` default).
- Every import from `@eslint/css-tree` and `@eslint/core` in the upstream
  source is `import type`. Runtime imports are `@eslint/css`
  (`CSSLanguage`, `CSSSourceCode`, the default export) and `tailwind-csstree`.
- The plugin does not depend on the `tailwindcss` package.
- The upstream TypeScript source is at
  `github.com/poupe-ui/eslint-plugin-tailwindcss`, tag `v0.3.1`, license
  MIT. Layout: `src/rules/<rule>.ts` (19 files), `src/utils/{ast,at-rules,
  browser-compat,css-properties,css,tailwind,theme,types}.ts`, `src/types.ts`,
  `src/parser/tailwind-v4-syntax.ts`, `src/configs/*.ts`.
- Upstream tests at `src/__tests__/`: `rules/<rule>.test.ts` for 14 rules,
  `parser/tailwind-v4-syntax.test.ts`, `utils/ast.test.ts`,
  `malformed-css.test.ts`. The 5 rules with no upstream test:
  `no-arbitrary-value-overuse`, `prefer-logical-properties`,
  `prefer-theme-tokens`, `relative-font-units`, `use-layers`.
- Read a file with
  `gh api "repos/poupe-ui/eslint-plugin-tailwindcss/contents/<path>?ref=v0.3.1"
  --jq .content | base64 -d`.

**`tailwind-csstree`** 0.4.2 (installed 0.3.3 under the poupe plugin) has
0 dependencies, about 270 lines, license Apache-2.0, author Nicholas C. Zakas.
Its peer range is `@eslint/css >=1.0.0`.

**`@eslint/css` 2.0.0** (published 2026-09-02) has one breaking change: it adds
`meta.languages` to its rules, so `css/*` rules run only on the `css/css`
language. This is why the `tailwindcss/css` language blocks 2.x. 2.0.1
(published 2026-10-15) is a bug-fix release. Its dependencies are `@eslint/core
^1.2.1`,
`@eslint/css-tree ^4.1.1` and `@eslint/plugin-kit ^0.7.3`.

**Where the poupe plugin is named in the repo:**

- `package.json`: `dependencies` and `bundledDependencies` (19 names each, no
  mismatch).
- `pnpm-workspace.yaml`: `allowBuilds` lists `@poupe/eslint-plugin-tailwindcss`.
- `tests/unit/peers.test.ts`: the `ALLOWED` list has one entry,
  `"@poupe/eslint-plugin-tailwindcss>eslint@^9.30.0"`. The test fails on a
  stale entry.
- `src/cli/commands/version.ts:82-90`: the regex list that selects plugin
  names for `--version` has `^@poupe/eslint-plugin-`.
- `.config/mise/tasks/p/upgrade.py:50-54` and
  `.github/workflows/deps-update.yml:47-54`: the `"!@eslint/css"` hold and
  its comment. The two lists must stay the same.
- `CLAUDE.md:56`: the hold of `@eslint/css` at 1.x.

**Consumer contract.** `src/config-factory.ts:19-24` merges
`overrides.<preset>.rules` by preset `name`. Nothing validates rule names, so
a renamed rule breaks a consumer override at lint time. Preset names and
plugin keys are an implicit public contract.

**Gates.** `code:format` (dprint, excludes `tests/`), `code:lint` (the
published linter, then the self-lint with `src/eslint.config.ts`),
`code:check` (tsc), `p:test` (build, then all vitest tests, golden included),
`p:preflight` (`p:test`, pack, `check-bindings.sh`, `smoke.mjs`),
`test:golden --update` (writes the golden snapshots again). There is no PR
CI workflow.

**Conventions.** Strict TypeScript, `verbatimModuleSyntax`, source imports
use `.js` extensions. `tests/` is not linted or formatted. Commit types:
`feat`, `fix`, `perf`, `refactor`, `revert`, `test`, `ops`, `docs`, `merge`,
`wip`; scopes: `cli`, `config`, `deps`, `fixtures`, `integration`, `tests`,
`unit`.

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

- The Vue-only rule `require-reference-in-vue` (D22, a revision after
  approval): the user never uses Vue.
- The other 5 languages of B08 (YAML, TOML, HTML, Astro, TypeScript). Each
  gets its own plan folder (D1).
- TypeScript 7. Its hold stays; plan 6 of B08 decides it.
- Tailwind class-name linting in HTML, JSX or Astro files. B07 proposed it and
  was closed as superseded by B08.
- New Tailwind rules, or behavior changes to the 19 ported rules. This plan
  ports with parity.
- The disabled `deps-update.yml` workflow design. Only its `@eslint/css` hold
  line changes here; the workflow stays disabled on GitHub.

## Parked

- B08: YAML — own the `yml/` rules on a YAML language with the fewest
  dependencies (plan 2 of B08).
- B08: TOML — own the `toml/` rules (plan 3 of B08).
- B08: HTML — own the `html/` rules (plan 4 of B08).
- B08: Astro — own the `astro/` rules; the native Astro compiler stays a
  dependency question for that plan (plan 5 of B08).
- B08: TypeScript — own the `@typescript-eslint/` rules; the parser and the
  TypeScript 6.x hold are questions for that plan (plan 6 of B08).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-22-own-tailwindcss-rules

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
