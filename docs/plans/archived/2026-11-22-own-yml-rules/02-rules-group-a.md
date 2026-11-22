# U2 — YAML rules, group A (block-mapping-colon-indicator-newline to indent)

- **Read first:** for each of the 11 rules below, the upstream source
  `src/rules/<rule>.ts` and the upstream test `tests/src/rules/<rule>.ts`,
  at tag `v3.10.0` of `ota-meshi/eslint-plugin-yml`. Read each with
  `gh api "repos/ota-meshi/eslint-plugin-yml/contents/<path>?ref=v3.10.0" --jq
  .content | base64 -d`.
  Also every file that U1 created in `src/plugins/yml/` and
  `tests/unit/plugins/yml/helpers/`.
- **Lazy-load:** `tests/unit/plugins/yml/fixtures/rules/<rule>/`, the
  upstream `src/index.ts` (the rule registry shape).

The 11 rules: `block-mapping-colon-indicator-newline`,
`block-mapping-question-indicator-newline`, `block-mapping`,
`block-sequence-hyphen-indicator-newline`, `block-sequence`, `file-extension`,
`flow-mapping-curly-newline`, `flow-mapping-curly-spacing`,
`flow-sequence-bracket-newline`, `flow-sequence-bracket-spacing`, `indent`.

## Ruling

> D19 — (a) A ported file may drop an eslint-disable or eslint-enable comment
> that names a rule this repo does not define, or rewrite it to the rule
> of this repo that it means; ESLint 10 reports an unknown rule in such a
> comment as an error, so code:lint would fail. (b) Where the repo's
> strict TypeScript (noUncheckedIndexedAccess, verbatimModuleSyntax, .js
> import extensions) rejects ported code, a unit fixes it only with
> changes that have no runtime effect: non-null assertions, casts, type
> annotations, import type, and .js or /index.js on relative imports. No
> runtime guard is added. List each kind of change as DECIDED. (Ruled for
> all B08 plans on 2026-11-22, from the rulings review of plan 6.)

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

## Edits

1. **`src/plugins/yml/rules/<rule>.ts`** (11 new files) — port each rule.
   Keep its `meta` and its behavior the same. Import the utils and types from
   U1's files. The first line is
   `// Ported from eslint-plugin-yml v3.10.0 (MIT), src/rules/<rule>.ts.`
   Convert to this repo's conventions: `.js` import extensions, `import type`
   for type-only imports, strict TS.
2. **`src/plugins/yml/rules/group-a.ts`** (new) — export `groupARules`, an
   object that maps each of the 11 rule names (without the `yml/` prefix)
   to its rule definition.
3. **`tests/unit/plugins/yml/rules/group-a/<rule>.test.ts`** (11 new
   files) — port each upstream test with U1's loader, which takes the
   plugin object as a parameter (D13 b). The first line is the
   source header with the upstream test path. Use the upstream config:
   `plugins: { yml: <plugin> }` and `language: "yml/yaml"`, where
   `<plugin>` is `{ rules: groupARules, languages: { yaml: new YAMLLanguage() }
   }`,
   because the plugin index does not exist until U5. Connect `RuleTester` to
   vitest in each file (`RuleTester.describe`, `it`, `itOnly` from
   `vitest`), as plan 1's tests do. Import from
   `../../../../../../src/plugins/yml/...js`.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then
  `pnpx vitest run tests/unit/plugins/yml/rules/group-a` passes.
- Each rule file and each test file starts with the source header line.

## Guardrails

- Do not edit any file that U1 created. If a rule needs a helper that U1 did
  not port, write it in the rule file and report it as `DECIDED:`. In a
  team, tell U3 and U4 so that they do not write the same helper again.
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

`feat(config): port the yml rules block-mapping-colon-indicator-newline to
indent`
