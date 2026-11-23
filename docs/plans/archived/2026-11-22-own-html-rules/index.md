# Plan — Own the HTML rules and language (2026-11-22)

## Goal

After this plan lands, the `html` preset uses our own 65 `html/` rules and
our own `html/html` language from `src/plugins/html/`, in TypeScript.
`@html-eslint/eslint-plugin` is not a dependency. The deprecated rule
`no-extra-spacing-attrs` is not ported. The other rules, the language name,
the template-literal support and the behavior stay the same.

This is plan 4 of 6 for backlog item B08. It requires plan 3,
`docs/plans/2026-11-22-own-toml-rules`. There is no reversal of a standing
decision.

## Facts the survey established

**The current html preset** (`src/config/presets/html.ts`) extends
`html.configs.recommended` of `@html-eslint/eslint-plugin`, sets
`language: "html/html"`, matches `**/*.html`, registers the plugin as
`html`, and overrides `html/indent` (`["error", 2]`),
`html/no-extra-spacing-tags` (`{ enforceBeforeSelfClose: true }`) and
`html/require-closing-tags` (`{ selfClosing: "always" }`), to match the
dprint markup formatter. The recommended config enables 18 rules:
`require-lang`, `require-img-alt`, `require-doctype`, `require-title`,
`no-multiple-h1`, `no-extra-spacing-tags`, `attrs-newline`,
`element-newline`, `no-duplicate-id`, `indent`, `require-li-container`,
`quotes`, `no-obsolete-tags`, `no-obsolete-attrs`, `require-closing-tags`,
`no-duplicate-attrs`, `use-baseline`, `no-duplicate-in-head`.

**@html-eslint/eslint-plugin 0.68.0** (MIT, Copyright (c) 2020 YeonJuan,
monorepo `github.com/yeonjuan/html-eslint`, tag `v0.68.0`, package path
`packages/eslint-plugin/`):

- JavaScript with JSDoc types. `lib/rules/` has 66 rules
  (`no-extra-spacing-attrs`
  is deprecated) and `lib/rules/utils/` (`array`, `branch-segments`,
  `capo-adapter` with `capo.d.ts`, `node`, `rule`, `settings`,
  `source-code`, `template-literal`, `visitors`).
  Also `lib/languages/` (`html-language.js`, `html-source-code.js`,
  `html-traversal-step.js`, `types.js`, `types.ts`), `lib/adapters/` (5),
  `lib/constants/` (5), `lib/data/entities.json`, `lib/types/`
  (`ast.ts`, `index.ts`, `rule.ts`, `settings.ts`), `lib/index.js`,
  `lib/exports.ts`, `lib/configs/`.
- Runtime imports: `@html-eslint/parser` (14), `@html-eslint/core` (13
  rules and the adapters), `@eslint/plugin-kit` (the language),
  `html-standard` (`no-redundant-role` only), `@rviscomi/capo.js`
  (`head-order`), `@html-eslint/template-parser` (`template-literal.js`).
  Type-only: `@html-eslint/types` (62), `eslint`, `@eslint/core`,
  `estree`, `es-html-parser`.
- Dependencies: `@eslint/plugin-kit ^0.4.1` (we ship 0.7.3),
  `html-standard ^0.0.13`, `@rviscomi/capo.js ^2.1.0`, and
  `@html-eslint/{core,types,parser,template-parser,template-syntax-parser}
  ^0.68.0`. Peer: `eslint >=8.0.0 || ^10.0.0-0`.
- Tests (`packages/eslint-plugin/tests/`): `rules/<rule>.test.js` (inline
  cases; each makes `createRuleTester()` and `createRuleTester("espree")`
  for template literals), `rule-tester.js`, `languages/` (2),
  `inline-disable.test.js`, `rules/utils/template-literal.test.js`, `e2e/`
  (`index.test.js`,
  `robertakarobin/{source.html,fixed.html,rules.js}`), `configs.test.js`,
  `plugin/export.test.js`.
- Read a file with `gh api
  "repos/yeonjuan/html-eslint/contents/packages/eslint-plugin/<path>?ref=v0.68.0"
  --jq .content | base64 -d`.

**The kept packages** (all MIT except capo.js, Apache-2.0; none has a peer):

| Package                        | Installed | Dependencies                                                                                                         |
| ------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------- |
| `@html-eslint/parser`          | 0.68.0    | `css-tree ^3.1.0`, `es-html-parser 0.3.2`, `@html-eslint/types`, `@html-eslint/template-syntax-parser`               |
| `@html-eslint/core`            | 0.68.0    | `html-standard ^0.0.13` (→ `vscode-css-languageservice`, `vscode-languageserver-textdocument`), `@html-eslint/types` |
| `@html-eslint/template-parser` | 0.68.0    | `es-html-parser 0.3.2`, `@html-eslint/types`                                                                         |
| `@rviscomi/capo.js`            | 2.3.1     | none                                                                                                                 |
| `@html-eslint/types`           | 0.68.0    | `@types/estree`, `es-html-parser`, `@types/css-tree`                                                                 |

**Consumers.** `~/Projects/github.com/virajp/virajp.dev/.config/linter.yaml`
overrides `html/attrs-newline` and `html/use-baseline` (both `off`). No
consumer config names `html/no-extra-spacing-attrs` (scan of 2026-11-22).

**From plans 1 to 3** (landed before this plan runs): `THIRD_PARTY_NOTICES.md`,
`src/plugins/{tailwindcss,yml,toml}/` (the same structure as this plan, in
TypeScript), the direct dependency `@eslint/plugin-kit` 0.7.3, the
devDependency `@eslint/core`, the pre-commit exclude `^tests/(.*/)?fixtures/`.

**Gates and conventions** are those of plans 1 to 3.

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

- The other B08 languages (Astro, TypeScript): their own plans.
- Porting `@html-eslint/parser`, `@html-eslint/core`,
  `@html-eslint/template-parser` or `@rviscomi/capo.js` (D2).
- The deprecated rule `no-extra-spacing-attrs` (D4).
- New HTML rules, or behavior changes.

## Parked

- B08: Astro — own the `astro/` rules (plan 5 of B08).
- B08: TypeScript — own the `@typescript-eslint/` rules (plan 6 of B08).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-22-own-html-rules

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
