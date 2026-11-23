# Plan — Own the TOML rules and language (2026-11-22)

## Goal

After this plan lands, the `toml` preset uses our own 22 `toml/` rules and
our own `toml/toml` language from `src/plugins/toml/`. `eslint-plugin-toml`
is not a dependency. The Vue-only rule `vue-custom-block/no-parsing-error`
and the deprecated rule `space-eq-sign` are not ported. The other rules, the
language name and the behavior stay the same.

This is plan 3 of 6 for backlog item B08. It requires plan 2,
`docs/plans/2026-11-22-own-yml-rules`, which adds `@eslint/plugin-kit` and
`@ota-meshi/ast-token-store` as direct dependencies, widens the pre-commit
exclude to `^tests/(.*/)?fixtures/`, and sets the conventions for vendored
upstream tests. There is no reversal of a standing decision.

## Facts the survey established

**The current toml preset** (`src/config/presets/toml.ts`) extends
`eslintPluginToml.configs.recommended`, sets `language: "toml/toml"`,
registers the plugin as `toml`, and matches `**/*.toml`. The recommended
config is three entries: `{ plugins: { toml: <the plugin> } }`
(upstream `src/configs/flat/base.ts`, shown as `{}` by a JSON dump); `{ files:
["*.toml", "**/*.toml"], language:
"toml/toml", rules: { "no-irregular-whitespace": "off", "spaced-comment":
"off" } }`; and the rules `toml/no-unreadable-number-separator`,
`toml/precision-of-fractional-seconds`, `toml/precision-of-integer` and
`toml/vue-custom-block/no-parsing-error`, all `error`.

**eslint-plugin-toml 1.5.0** (MIT, Copyright (c) 2021 Yosuke Ota,
`github.com/ota-meshi/eslint-plugin-toml`, tag `v1.5.0`):

- 24 rules in `src/rules/`. `space-eq-sign` is deprecated.
  `vue-custom-block/no-parsing-error` is for Vue files.
- `src/language/` (`index.ts`, `toml-language.ts`, `toml-source-code.ts`),
  `src/utils/` (`ast-utils.ts`, `bit.ts`, `casing.ts`, `index.ts`,
  `rules.ts` — a generated registry of all rules), `src/meta.ts`,
  `src/types.ts`, `src/index.ts`.
- Dependencies: `@eslint/core`, `@eslint/plugin-kit`,
  `@ota-meshi/ast-token-store`, `debug`, `toml-eslint-parser`. Peer:
  `eslint >=9.38.0`.
- Tests: `tests/src/rules/<rule>.ts`, `tests/src/language/` (6 files:
  `directive-comments` — every case needs a `toml/` rule —, `token-store`,
  `toml-language`, `toml-source-code`,
  `toml-source-code-with-core-rules`,
  `toml-source-code-with-stylistic-rules` — imports
  `@stylistic/eslint-plugin`), `tests/src/utils/{casing,rules}.ts`,
  `tests/src/meta.ts`, `tests/src/eslint-plugin.ts`, `tests/src/configs/`,
  `tests/src/rules-without-vue-eslint-parser.ts` (lints `.js` code with
  each rule on and expects no message), `tests/utils/utils.ts` (the loader;
  imports `vue-eslint-parser`; has write paths at lines 228, 247 and 295) and
  `tests/utils/apply-fixer.ts`.
- Fixtures: `tests/fixtures/rules/` has 438 files (88 KB), one directory per
  rule, including `space-eq-sign/` and `vue-custom-block/` (the only
  directory with `.vue` files: 3). `tests/fixtures/integrations/` has 7.
- Read a file with `gh api
  "repos/ota-meshi/eslint-plugin-toml/contents/<path>?ref=v1.5.0" --jq .content
  | base64 -d`. Get the tree with
  `gh api repos/ota-meshi/eslint-plugin-toml/tarball/v1.5.0 >
  <scratch>/toml.tgz`.

**toml-eslint-parser 1.0.3** (MIT, hand-written, about 2,200 lines): one
dependency, `eslint-visitor-keys ^5.0.0`; no peers. ESLint 10 depends on
`eslint-visitor-keys ^5.0.1`. It is in the tree today under the plugin, not a
direct dependency.

**`--version`** (`src/cli/commands/version.ts:82-90`) lists dependency names
that match `^eslint-plugin-` and other plugin patterns;
`toml-eslint-parser` does not match, so no edit is necessary there.

**From plans 1 and 2** (landed before this plan runs):
`THIRD_PARTY_NOTICES.md`, `src/plugins/tailwindcss/`, `src/plugins/yml/`
(the same structure as this plan), the direct dependencies
`@eslint/plugin-kit` and `@ota-meshi/ast-token-store`, the devDependency
`@eslint/core`, the pre-commit exclude `^tests/(.*/)?fixtures/` in
`.config/pre-commit-config.yaml` and `.config/bootstrap/tools.toml`.

**Consumers.** A scan of `~/Projects` on 2026-11-22 found no
`.config/linter.yaml` that names `toml/space-eq-sign` or a Vue rule.

**Gates and conventions** are those of plans 1 and 2.

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

- The other B08 languages (HTML, Astro, TypeScript): their own plans.
- Porting `toml-eslint-parser` (D3).
- Vue support and the deprecated rule `space-eq-sign` (D2).
- New TOML rules or behavior changes.

## Parked

- B08: HTML — own the `html/` rules (plan 4 of B08).
- B08: Astro — own the `astro/` rules (plan 5 of B08).
- B08: TypeScript — own the `@typescript-eslint/` rules (plan 6 of B08).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-22-own-toml-rules

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
