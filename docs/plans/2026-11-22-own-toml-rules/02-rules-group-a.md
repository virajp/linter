# U2 — TOML rules, group A (array-bracket-newline to no-mixed-type-in-array)

- **Read first:** for each of the 11 rules below, the upstream source
  `src/rules/<rule>.ts` and the upstream test `tests/src/rules/<rule>.ts`,
  at tag `v1.5.0` of `ota-meshi/eslint-plugin-toml`. Read each with
  `gh api "repos/ota-meshi/eslint-plugin-toml/contents/<path>?ref=v1.5.0" --jq
  .content | base64 -d`.
  Also every file that U1 created, and one rule unit of plan 2
  (`src/plugins/yml/rules/`, `tests/unit/plugins/yml/rules/`) for the shape.
- **Lazy-load:** `tests/unit/plugins/toml/fixtures/rules/<rule>/`.

The 11 rules: `array-bracket-newline`, `array-bracket-spacing`,
`array-element-newline`, `comma-style`, `indent`, `inline-table-curly-newline`,
`inline-table-curly-spacing`, `inline-table-key-value-newline`, `key-spacing`,
`keys-order`, `no-mixed-type-in-array`.

## Ruling

> D10 — (a) A ported file may drop an eslint-disable or eslint-enable comment
> that names a rule this repo does not define, or rewrite it to the rule
> of this repo that it means; ESLint 10 reports an unknown rule in such a
> comment as an error, so code:lint would fail. (b) Where the repo's
> strict TypeScript (noUncheckedIndexedAccess, verbatimModuleSyntax, .js
> import extensions) rejects ported code, a unit fixes it only with
> changes that have no runtime effect: non-null assertions, casts, type
> annotations, import type, and .js or /index.js on relative imports. No
> runtime guard is added. List each kind of change as DECIDED. (Ruled for
> all B08 plans on 2026-11-22, from the rulings review of plan 6.)

> D9 — A ported upstream test case that fails only because ESLint 10's
> RuleTester or the vitest wiring is stricter than upstream's setup (jest
> on ESLint 9) — not because the rule behaves differently — may have its
> test setup changed: for example, remove a duplicate case, or add a
> property that ESLint 10 requires. Never change the expected messages,
> message ids, locations, output or suggestions. List each change as
> DECIDED; the review unit checks them. A case whose expected result
> differs stops the run with a QUESTION.

> D1 — Keep the toml/ namespace. Credit the MIT code in
> THIRD_PARTY_NOTICES.md plus a one-line source header in each ported file,
> test files included. Put the code in src/plugins/toml/. No Vue support.
> Each edit unit runs code:format --fix before it returns.

> D2 — 22 rules of eslint-plugin-toml 1.5.0: all except the Vue-only rule
> vue-custom-block/no-parsing-error and the deprecated rule space-eq-sign.

> D5 — A RuleTester test for each rule, ported from tests/src/rules/<rule>.ts
> at tag v1.5.0 with the upstream config (plugins { toml: <plugin> },
> language toml/toml) and the ported loader, which takes the plugin object
> as a parameter. Each test file connects RuleTester to vitest itself and
> imports from src/.

> D7 — teams: wave 2 has two edit units. If a team cannot start, the run
> uses solo.

## Edits

1. **`src/plugins/toml/rules/<rule>.ts`** (11 new files) — port each rule.
   Keep its `meta` and its behavior the same. Import the utils and types from
   U1's files. The first line is
   `// Ported from eslint-plugin-toml v1.5.0 (MIT), src/rules/<rule>.ts.`
2. **`src/plugins/toml/rules/group-a.ts`** (new) — export `groupARules`, an
   object that maps each of the 11 rule names (without the `toml/` prefix)
   to its rule definition.
3. **`tests/unit/plugins/toml/rules/group-a/<rule>.test.ts`** (11 new
   files) — port each upstream test with U1's loader. The first line is the
   source header with the upstream test path. The plugin object is
   `{ rules: groupARules, languages: { toml: new TOMLLanguage() } }`, because
   the plugin index does not exist until U4. Import from
   `../../../../../../src/plugins/toml/...js`.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then
  `pnpx vitest run tests/unit/plugins/toml/rules/group-a` passes.
- Each rule file and each test file starts with the source header line.

## Guardrails

- Do not edit any file that U1 created. If a rule needs a helper that U1 did
  not port, write it in the rule file and report it as `DECIDED:`. In a
  team, tell U3.
- Do not create `src/plugins/toml/index.ts` or the other group registry.
- Do not edit `package.json`, `pnpm-lock.yaml`, a preset or a fixture.
- A rule must not change behavior. A case that fails only because ESLint 10
  or vitest is stricter may have its setup changed, never its expected
  result, and each change is listed as `DECIDED:` (D9). Any other failing
  upstream case returns a QUESTION.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): port the toml rules array-bracket-newline to
no-mixed-type-in-array`
