# U4 — YAML rules, group C (no-tab-indent to spaced-comment)

- **Read first:** for each of the 9 rules below, the upstream source
  `src/rules/<rule>.ts` and the upstream test `tests/src/rules/<rule>.ts`,
  at tag `v3.10.0` of `ota-meshi/eslint-plugin-yml`. Read each with
  `gh api "repos/ota-meshi/eslint-plugin-yml/contents/<path>?ref=v3.10.0" --jq
  .content | base64 -d`.
  Also every file that U1 created in `src/plugins/yml/` and
  `tests/unit/plugins/yml/helpers/`.
- **Lazy-load:** `tests/unit/plugins/yml/fixtures/rules/<rule>/`, the
  upstream `src/index.ts` (the rule registry shape).

The 9 rules: `no-tab-indent`, `no-trailing-spaces`, `no-trailing-zeros`,
`plain-scalar`, `quotes`, `require-string-key`, `sort-keys`,
`sort-sequence-values`, `spaced-comment`.

## Ruling

> D18 — A ported upstream test case that fails only because ESLint 10's
> RuleTester or the vitest wiring is stricter than upstream's setup (jest
> on ESLint 9) — not because the rule behaves differently — may have its
> test setup changed: for example, remove a duplicate case, or add a
> property that ESLint 10 requires. Never change the expected messages,
> message ids, locations, output or suggestions. List each change as
> DECIDED; the review unit checks them. A case whose expected result
> differs stops the run with a QUESTION.

> D1 — Keep the yml/ namespace. A one-line source header in each ported
> file, test files included. The code goes in src/plugins/yml/.

> D2 — The packages natural-compare, diff-sequences, escape-string-regexp,
> @eslint/plugin-kit and @ota-meshi/ast-token-store stay as dependencies; U5
> lists them. yaml-eslint-parser stays.

> D3 — All 30 rules of eslint-plugin-yml 3.10.0 except the Vue-only rule
> vue-custom-block/no-parsing-error.

> D5 — A RuleTester test for each rule, ported from the upstream test at tag
> v3.10.0 with the upstream config (plugins { yml: our plugin }, language
> yml/yaml) and the upstream fixture loader.

> D9 — teams: wave 2 has three edit units, which can message each other
> about shared helpers. If a team cannot start, the run uses solo.

> D12 — Do not port vue-custom-block/no-parsing-error, its tests or its
> fixtures.

## Edits

1. **`src/plugins/yml/rules/<rule>.ts`** (9 new files) — port each rule.
   Keep its `meta` and its behavior the same. Import the utils and types from
   U1's files. The first line is
   `// Ported from eslint-plugin-yml v3.10.0 (MIT), src/rules/<rule>.ts.`
   Convert to this repo's conventions: `.js` import extensions, `import type`
   for type-only imports, strict TS.
2. **`src/plugins/yml/rules/group-c.ts`** (new) — export `groupCRules`, an
   object that maps each of the 9 rule names (without the `yml/` prefix)
   to its rule definition.
3. **`tests/unit/plugins/yml/rules/group-c/<rule>.test.ts`** (9 new
   files) — port each upstream test with U1's loader, which takes the
   plugin object as a parameter (D13 b). The first line is the
   source header with the upstream test path. Use the upstream config:
   `plugins: { yml: <plugin> }` and `language: "yml/yaml"`, where
   `<plugin>` is `{ rules: groupCRules, languages: { yaml: new YAMLLanguage() }
   }`,
   because the plugin index does not exist until U5. Connect `RuleTester` to
   vitest in each file (`RuleTester.describe`, `it`, `itOnly` from
   `vitest`), as plan 1's tests do. Import from
   `../../../../../../src/plugins/yml/...js`.

   The `sort-keys` case that lints `../../../package.json` lints
   `tests/unit/plugins/yml/fixtures/upstream-package.json` instead, with the
   same options (D16).

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then
  `pnpx vitest run tests/unit/plugins/yml/rules/group-c` passes.
- Each rule file and each test file starts with the source header line.

## Guardrails

- Do not edit any file that U1 created. If a rule needs a helper that U1 did
  not port, write it in the rule file and report it as `DECIDED:`. In a
  team, tell U2 and U3 so that they do not write the same helper again.
- Do not create `src/plugins/yml/index.ts` or another group registry.
- Do not edit `package.json`, `pnpm-lock.yaml`, a preset or a fixture.
- A rule must not change behavior. A case that fails only because ESLint 10
  or vitest is stricter may have its setup changed, never its expected
  result, and each change is listed as `DECIDED:` (D18). Any other failing
  upstream case returns a QUESTION.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D17).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): port the yml rules no-tab-indent to spaced-comment`
