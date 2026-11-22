# U3 — TOML rules, group B (no-non-decimal-integer to tables-order)

- **Read first:** for each of the 11 rules below, the upstream source
  `src/rules/<rule>.ts` and the upstream test `tests/src/rules/<rule>.ts`,
  at tag `v1.5.0` of `ota-meshi/eslint-plugin-toml`. Read each with
  `gh api "repos/ota-meshi/eslint-plugin-toml/contents/<path>?ref=v1.5.0" --jq
  .content | base64 -d`.
  Also every file that U1 created, and one rule unit of plan 2
  (`src/plugins/yml/rules/`, `tests/unit/plugins/yml/rules/`) for the shape.
- **Lazy-load:** `tests/unit/plugins/toml/fixtures/rules/<rule>/`.

The 11 rules: `no-non-decimal-integer`, `no-space-dots`,
`no-unreadable-number-separator`, `padding-line-between-pairs`,
`padding-line-between-tables`, `precision-of-fractional-seconds`,
`precision-of-integer`, `quoted-keys`, `spaced-comment`,
`table-bracket-spacing`, `tables-order`.

## Ruling

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
2. **`src/plugins/toml/rules/group-b.ts`** (new) — export `groupBRules`, an
   object that maps each of the 11 rule names (without the `toml/` prefix)
   to its rule definition.
3. **`tests/unit/plugins/toml/rules/group-b/<rule>.test.ts`** (11 new
   files) — port each upstream test with U1's loader. The first line is the
   source header with the upstream test path. The plugin object is
   `{ rules: groupBRules, languages: { toml: new TOMLLanguage() } }`, because
   the plugin index does not exist until U4. Import from
   `../../../../../../src/plugins/toml/...js`.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then
  `pnpx vitest run tests/unit/plugins/toml/rules/group-b` passes.
- Each rule file and each test file starts with the source header line.

## Guardrails

- Do not edit any file that U1 created. If a rule needs a helper that U1 did
  not port, write it in the rule file and report it as `DECIDED:`. In a
  team, tell U2.
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

`feat(config): port the toml rules no-non-decimal-integer to tables-order`
