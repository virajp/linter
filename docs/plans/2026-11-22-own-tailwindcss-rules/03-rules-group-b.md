# U3 — Tailwind rules, group B (prefer-logical-properties to valid-theme-function)

- **Read first:** for each of the 8 rules below, the upstream source
  `src/rules/<rule>.ts` and, where it exists, the upstream test
  `src/__tests__/rules/<rule>.test.ts`, at tag `v0.3.1`. Read each with
  `gh api "repos/poupe-ui/eslint-plugin-tailwindcss/contents/<path>?ref=v0.3.1"
  --jq .content | base64 -d`.
  Also read every file in `src/plugins/tailwindcss/` that U1 created.
- **Lazy-load:** the upstream `src/rules/index.ts` (the registry shape),
  `node_modules/@eslint/css/dist/` (for `prefer-logical-properties`,
  `relative-font-units` and `use-layers`, which wrap `@eslint/css` rules;
  `use-baseline` is standalone, with its own `utils/browser-compat`).

The 8 rules: `prefer-logical-properties`, `prefer-theme-tokens`,
`relative-font-units`, `use-baseline`,
`use-layers`, `valid-apply-directive`, `valid-modifier-syntax`,
`valid-theme-function`. These 4 have no upstream test:
`prefer-logical-properties`, `prefer-theme-tokens`, `relative-font-units`,
`use-layers`.

## Ruling

> D2 — Keep current names: our plugins register under the same keys
> (tailwindcss/, ...). No consumer override breaks.

> D4 — All 18 rules of @poupe/eslint-plugin-tailwindcss 0.3.1 except the
> Vue-only rule require-reference-in-vue (D22).

> D22 — Do not port require-reference-in-vue or its test. The user never
> uses Vue.

> D5 — Each ported file gets a one-line header that names its source.

> D6 — A RuleTester test for each rule in tests/unit/, with valid and invalid
> cases ported from the upstream test files at tag v0.3.1 where they exist,
> plus each fix output. New tests for the 5 rules with no upstream test.

> D8 — Our rules declare meta.languages ["css/css"].

> D12 — Imports from @eslint/css-tree and @eslint/core are type-only
> (import type).

> D14 — Port from the TypeScript source at tag v0.3.1, read with gh api.

> D16 — Wrap the core rule: a new object that spreads the @eslint/css rule
> and sets meta.languages ["css/css"] (a new meta object, so the shared core
> object stays unchanged). The rules follow @eslint/css after the 2.x
> upgrade, as they do upstream today.

> D11 — teams: wave 2 has two edit units (the two rule groups), which can
> message each other about shared helpers. If a team cannot start, the run
> uses solo.

## Edits

1. **`src/plugins/tailwindcss/rules/<rule>.ts`** (8 new files) — port each
   rule. Keep its `meta` (type, docs, messages, schema, fixable,
   hasSuggestions, defaultOptions) and its behavior the same, and add
   `meta.languages: ["css/css"]`. Import helpers, types and the syntax from
   U1's files. The first line is
   `// Ported from @poupe/eslint-plugin-tailwindcss v0.3.1 (MIT),
   src/rules/<rule>.ts.`
   Convert to this repo's conventions: `.js` import extensions, `import type`
   for type-only imports, strict TS.
2. **`src/plugins/tailwindcss/rules/group-b.ts`** (new) — export
   `groupBRules`, an object that maps each of the 8 rule names (without the
   `tailwindcss/` prefix) to its rule definition.
3. **`tests/unit/plugins/tailwindcss/rules/<rule>.test.ts`** (8 new files) —
   one test per rule with ESLint's `RuleTester` (from `eslint`). Each test
   file starts with the source header line of its upstream test path (D5).
   This repo has no vitest globals, so each file imports `describe` and `it`
   from `vitest` and sets `RuleTester.describe = describe`,
   `RuleTester.it = it` and `RuleTester.itOnly = it.only` before it calls
   `run`. Use no shared helper file.

   Cases ported from the upstream test keep the upstream config exactly
   (upstream uses `{ language: "css/css", plugins: { css } }` with our rule
   registered as `tailwindcss`, and no `tolerant` or `customSyntax` unless
   the upstream case sets them). New cases use the config of the css preset:
   `plugins: { css, tailwindcss: { rules: groupBRules } }`, `language:
   "css/css"`
   and `languageOptions: { tolerant: true, customSyntax: tailwindSyntax }`.
   `css` is the default export of `@eslint/css`. Import from
   `../../../../../src/plugins/tailwindcss/...js`, as the other unit tests
   import from `src/`.

   Port every valid and invalid case of the upstream test, with its message
   ids, locations, `output` and `suggestions`. For the 4 rules with no upstream
   test,
   write cases for each message, each option and each fix or suggestion
   from the rule's source.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build` passes, then
  `pnpx vitest run tests/unit/plugins/tailwindcss/rules` passes for the 8
  test files of this unit.
- `node --input-type=module -e` that imports
  `./dist/plugins/tailwindcss/rules/group-b.js` prints the 8 rule names, each
  with `meta.languages` equal to `["css/css"]`.
- Each rule file starts with the source header line.

## Guardrails

- Do not edit any file in `src/plugins/tailwindcss/` that U1 created. If a
  rule needs a helper that U1 did not port, write it in the rule file and
  report it as `DECIDED:`. In a team, tell U2 so that it does not write the
  same helper a second time.
- Do not create `src/plugins/tailwindcss/index.ts` or `rules/group-a.ts`.
- Do not edit `package.json`, `pnpm-lock.yaml` or any preset.
- A rule must not change behavior. If an upstream test fails against the
  ported rule because of a difference between the upstream test setup and
  ours, return a QUESTION. Do not change the expected result.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D23).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): port the tailwind rules prefer-logical-properties to
valid-theme-function`
