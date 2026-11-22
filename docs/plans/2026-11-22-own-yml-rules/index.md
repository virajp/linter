# Plan — Own the YAML rules and language (2026-11-22)

## Goal

After this plan lands, the `yaml` preset uses our own 30 `yml/` rules and our
own `yml/yaml` language from `src/plugins/yml/`. `eslint-plugin-yml` is not a
dependency. The Vue-only rule `vue-custom-block/no-parsing-error` is not
ported, because the user never uses Vue (D12). The other rules, the
language name and the behavior stay the same.

This is plan 2 of 6 for backlog item B08. It requires plan 1,
`docs/plans/2026-11-22-own-tailwindcss-rules`, which creates
`THIRD_PARTY_NOTICES.md` and the `src/plugins/` layout. There is no reversal
of a standing decision.

The user's dependency criterion (2026-11-22): a direct dependency is not a big
concern, because we control its version. The problem makers are the
transitive dependencies that each direct dependency adds, above all the
common ones that create version conflicts between direct dependencies.

## Facts the survey established

**The current yaml preset** (`src/config/presets/yaml.ts`) extends
`yaml.configs["flat/recommended"]` from `eslint-plugin-yml`, sets
`languageOptions.parser` to `yaml-eslint-parser`, registers the plugin as
`yml`, and matches `**/*.yaml` and `**/*.yml`. The golden config snapshots
`config/file.yaml.json` and `config/file.yml.json` are identical: language
`yml/yaml`, parser `yaml-eslint-parser`, 7 `yml/` rules, all `error`
(`no-empty-document`, `no-empty-key`, `no-empty-mapping-value`,
`no-empty-sequence-entry`, `no-irregular-whitespace`, `no-tab-indent`,
`vue-custom-block/no-parsing-error`), and the core rules
`no-irregular-whitespace`, `no-unused-vars` and `spaced-comment` off.

**Markdown frontmatter** uses `@eslint/markdown`'s own option
(`languageOptions.frontmatter: "yaml"`), not this plugin.

**eslint-plugin-yml 3.10.0** (MIT, `github.com/ota-meshi/eslint-plugin-yml`,
tag `v3.10.0`):

- 31 rules in `src/rules/` (one in `src/rules/vue-custom-block/`).
- The language in `src/language/` (`index.ts`, `yaml-language.ts`,
  `yaml-source-code.ts`); `src/utils/` (`ast-utils.ts`,
  `calc-shortest-edit-script.ts`, `casing.ts`, `index.ts`, `rules.ts`,
  `yaml.ts`); `src/meta.ts`, `src/types.ts`, `src/index.ts`.
- Runtime imports: `yaml-eslint-parser` (language, utils, `key-name-casing`,
  `plain-scalar`, `sort-sequence-values`), `@eslint/plugin-kit` and
  `@ota-meshi/ast-token-store` (source code), `natural-compare`
  (`sort-keys`, `sort-sequence-values`), `diff-sequences`
  (`calc-shortest-edit-script`), `escape-string-regexp` (`spaced-comment`),
  `node:path`. Type-only: `@eslint/core`, `eslint`.
- Peer: `eslint >=9.38.0`.
- Tests: `tests/src/rules/<rule>.ts` (31), `tests/src/language/*.ts` (6:
  `directive-comments`, `token-store`, `yaml-language`, `yaml-source-code`,
  `yaml-source-code-with-core-rules`, `yaml-source-code-with-stylistic-rules`),
  `tests/utils/utils.ts` (the fixture loader `loadTestCases`) and
  `tests/utils/apply-fixer.ts`. A rule test is
  `new RuleTester({ plugins: { yml: plugin }, language: "yml/yaml" })` and
  `tester.run(name, rule, loadTestCases(name))`.
- Fixtures: `tests/fixtures/` has 7,854 files (`rules/`, `yaml-test-suite/`,
  `integrations/`), 37 of them `.vue` files that the loader runs with
  `vue-eslint-parser`.
- Read a file with
  `gh api "repos/ota-meshi/eslint-plugin-yml/contents/<path>?ref=v3.10.0" --jq
  .content | base64 -d`.
  Get the whole tree with
  `gh api repos/ota-meshi/eslint-plugin-yml/tarball/v3.10.0 >
  <scratch>/yml.tgz`.

**The packages and their trees:**

| Package                      | Version now            | Transitive deps                             | Peers             |
| ---------------------------- | ---------------------- | ------------------------------------------- | ----------------- |
| `eslint-plugin-yml`          | 3.10.0                 | 7 direct                                    | `eslint >=9.38.0` |
| `yaml-eslint-parser`         | 2.1.0 (direct already) | `eslint-visitor-keys ^5.0.0`, `yaml ^2.0.0` | none              |
| `@eslint/plugin-kit`         | 0.7.3 (hoisted)        | `@eslint/core`, `levn`                      | none              |
| `@ota-meshi/ast-token-store` | 0.3.x                  | none                                        | none              |
| `natural-compare`            | 1.4.0                  | none                                        | none              |
| `diff-sequences`             | 29.x                   | none                                        | none              |
| `escape-string-regexp`       | 5.0.0                  | none                                        | none              |

ESLint 10 depends on `eslint-visitor-keys ^5.0.1`; this package pins `yaml`
2.9.1 directly (`src/config-loader.ts` uses it).

**Hooks and fixtures.** `.config/pre-commit-config.yaml:126` has the global
`exclude: (^|/)\.config/mise/locks/|^tests/fixtures/`; the file says that a
change in it stays across bootstrap syncs. `smoke.mjs` and
`tests/golden/lint.test.ts` lint every file in `tests/fixtures/`, so the
upstream fixtures must not go there.

**From plan 1** (landed before this plan runs): `THIRD_PARTY_NOTICES.md`,
`src/plugins/tailwindcss/`, the devDependencies `@eslint/core` and
`@eslint/css-tree`, rule tests under `tests/unit/plugins/` that import from
`src/` and connect `RuleTester` to vitest in each file.

**Gates and conventions** are those of plan 1: `code:format`, `code:lint`,
`code:check`, `p:test`, `p:preflight`, `test:golden --update`; strict
TypeScript with `.js` import extensions; `tests/` is not linted or
formatted; commit scopes `cli`, `config`, `deps`, `fixtures`, `integration`,
`tests`, `unit`.

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

- The other B08 languages (TOML, HTML, Astro, TypeScript): their own plans.
- Porting `yaml-eslint-parser` or the small packages (D2).
- Vue support: the rule `vue-custom-block/no-parsing-error`, its fixtures,
  and the 37 `.vue` fixtures (D10, D12).
- Markdown frontmatter: `@eslint/markdown` handles it.
- New YAML rules or behavior changes.

## Parked

- B08: TOML — own the `toml/` rules (plan 3 of B08).
- B08: HTML — own the `html/` rules (plan 4 of B08).
- B08: Astro — own the `astro/` rules (plan 5 of B08).
- B08: TypeScript — own the `@typescript-eslint/` rules (plan 6 of B08).

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-22-own-yml-rules

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
