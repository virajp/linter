DECISION 2026-11-22 ★4 | package:linter | own the Tailwind CSS rules in
src/plugins/tailwindcss/, drop @poupe/eslint-plugin-tailwindcss, upgrade
@eslint/css to 2.0.1 | plan docs/plans/2026-11-22-own-tailwindcss-rules

# Own the Tailwind CSS rules

Source: `docs/plans/2026-11-22-own-tailwindcss-rules/index.json`, decisions D1
to D26. This is plan 1 of 6 of backlog item B08. D26 was decided during the
run.

## Rulings for all of B08

The later B08 plans (YAML, TOML, HTML, Astro, TypeScript) inherit these
rulings.

- **D1** ★4 | plan split | one plan folder per language, 6 in a chain: plugin
  base + CSS/Tailwind, YAML, TOML, HTML, Astro, TypeScript; each later folder
  requires folder 1 | alt: two folders; one folder — rejected
- **D2** ★4 | rule namespace | our plugins keep the current keys
  (`tailwindcss/`, `html/`, `yml/`, `toml/`, `astro/`, `@typescript-eslint/`),
  so no consumer override breaks | alt: one new namespace; a new key per
  language — rejected (MAJOR release)
- **D5** ★3 | credit for ported MIT code | one `THIRD_PARTY_NOTICES.md` with
  the license text and copyright of each source, shipped through `files` of
  `package.json`; each ported file has a one-line source header | alt: the
  full notice in each file; a clean-room rewrite — rejected
- **D7** ★4 | plugin location | inside this package, `src/plugins/<name>/`,
  compiled into `dist/` | alt: a separate npm package in a workspace —
  rejected

Other rulings of this plan also apply after it: **D24** and **D25** are ruled
for all B08 plans, and **D22** also applies to plan 2 (YAML). The
[Tailwind plan](#tailwind-plan) section records them.

## Tailwind plan

- **D3** ★3 | `tailwind-csstree` | write our own Tailwind 4 syntax for CSSTree;
  zero new packages | alt: keep `tailwind-csstree` 0.4.2 — rejected
- **D4** ★3 | rules to port | all 18 rules of the poupe plugin 0.3.1, without
  the Vue-only rule (D22) | alt: the 15 enabled rules; all 19 — rejected
- **D6** ★3 | test bar | a RuleTester test for each rule, cases ported from
  upstream v0.3.1, new tests for the 5 rules with none; golden problems and
  fixes unchanged before the upgrade | alt: golden snapshots only — rejected
- **D8** ★4 | language | no own language: the `css/css` language of
  `@eslint/css` with our syntax as `customSyntax` and `tolerant: true`; our
  rules declare `meta.languages ["css/css"]` | alt: keep a `tailwindcss/css`
  language — rejected (2.x rejects every `css/*` rule on it)
- **D9** ★3 | parity proof | switch to our plugin on `@eslint/css` 1.4.0 and
  check the golden snapshots first, then upgrade to 2.0.1 | alt: port and
  upgrade in one step — rejected
- **D10** ★2 | review unit | yes, one review unit after U4 (about 3,500 lines
  of shipped rule source) | alt: wave review only — rejected
- **D11** ★1 | execution mode | teams; solo if a team cannot start | alt: solo
  — rejected
- **D12** ★2 | type-only packages | `@eslint/css-tree` and `@eslint/core` as
  exact-pinned devDependencies, `import type` only | alt: rely on hoisting; own
  type definitions — rejected
- **D13** ★3 | rule configuration | in the `css` preset, not in the plugin;
  the plugin exports `meta` and `rules` only; the preset copies the poupe
  recommended severities and options, without `require-reference-in-vue`, and
  keeps `files ["**/*.css"]` | alt: `configs.recommended` in the plugin —
  rejected
- **D14** ★2 | port source | the TypeScript source at tag v0.3.1, read with
  `gh api` | alt: the bundled dist in `node_modules` — rejected
- **D15** ★3 | release level | MINOR: new behavior from `@eslint/css` 2.x, the
  `tailwindcss/css` language and the Vue-only rule removed, no other rule name
  changes | alt: MAJOR; PATCH — rejected
- **D16** ★2 | rules that upstream re-exports from `@eslint/css` | wrap the
  core rule with a new `meta` that sets `languages ["css/css"]` | alt: copy the
  1.4.0 source — rejected
- **D17** ★2 | tsc errors from the upgrade | U4 may fix compile errors in
  `src/plugins/tailwindcss/` with no behavior change | alt: stop with a
  question — rejected
- **D18** ★2 | `tailwind-csstree` notice | an acknowledgement section with its
  Apache-2.0 license, worded as a reference, with no copyright line | alt: no
  entry — rejected
- **D19** ★2 | new problem in `css/valid.css` after the upgrade | U7 changes
  only the reported CSS and keeps its modern syntax | alt: stop with a question
  — rejected
- **D20** ★3 | changed `tailwindcss/` problem after the upgrade | passes only
  for a rule that wraps or reuses an `@eslint/css` rule; any other change stops
  the run | alt: accept every change — rejected
- **D21** ★2 | ported test changed by the upgrade | U4 may change expected
  results only in tests of rules that wrap or reuse an `@eslint/css` rule | alt:
  stop for every failing test — rejected
- **D22** ★3 | Vue-only rule `require-reference-in-vue` | not ported, not set:
  the user does not use Vue; plan 2 drops
  `yml/vue-custom-block/no-parsing-error`
  by the same ruling | alt: port it — rejected
- **D23** ★1 | formatting before the unit gate | each edit unit runs
  `code:format --fix` before it returns | alt: a `--fix` unit gate — rejected
- **D24** ★3 | ported test that fails only from stricter ESLint 10 or vitest |
  change the test setup only, never the expected results; ruled for all B08
  plans | alt: ask for each case — rejected
- **D25** ★2 | unknown-rule disable comments and strict-TS errors in ported
  code | drop or rewrite the comment; fix TS errors only with changes that have
  no runtime effect; ruled for all B08 plans | alt: define the unknown rules;
  add runtime guards — rejected
- **D26** ★1 | header of a new test file with no upstream test | a
  `// New test: ...` line in all 5 new test files | alt: no header — rejected
