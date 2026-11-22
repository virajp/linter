# U2 — Tailwind rules, group A (consistent-spacing to no-invalid-properties)

- **Read first:** for each of the 10 rules below, the upstream source
  `src/rules/<rule>.ts` and, where it exists, the upstream test
  `src/__tests__/rules/<rule>.test.ts`, at tag `v0.3.1`. Read each with
  `gh api "repos/poupe-ui/eslint-plugin-tailwindcss/contents/<path>?ref=v0.3.1"
  --jq .content | base64 -d`.
  Also read every file in `src/plugins/tailwindcss/` that U1 created.
- **Lazy-load:** the upstream `src/rules/index.ts` (the registry shape),
  `node_modules/@eslint/css/dist/` (for the rules that wrap a `@eslint/css`
  rule).

The 10 rules: `consistent-spacing`, `no-arbitrary-value-overuse`,
`no-conflicting-utilities`, `no-duplicate-imports`, `no-duplicate-reference`,
`no-empty-blocks`, `no-important`, `no-invalid-at-rules`,
`no-invalid-named-grid-areas`, `no-invalid-properties`. Only
`no-arbitrary-value-overuse` has no upstream test.

## Ruling

> D2 — Keep current names: our plugins register under the same keys
> (tailwindcss/, ...). No consumer override breaks.

> D4 — All 19 rules of @poupe/eslint-plugin-tailwindcss 0.3.1.

> D5 — Each ported file gets a one-line header that names its source.

> D6 — A RuleTester test for each rule in tests/unit/, with valid and invalid
> cases ported from the upstream test files at tag v0.3.1 where they exist,
> plus each fix output. New tests for the 5 rules with no upstream test.

> D8 — Our rules declare meta.languages ["css/css"].

> D12 — Imports from @eslint/css-tree and @eslint/core are type-only
> (import type).

> D14 — Port from the TypeScript source at tag v0.3.1, read with gh api.

> D11 — teams: wave 2 has two edit units (the two rule groups), which can
> message each other about shared helpers. If a team cannot start, the run
> uses solo.

## Edits

1. **`src/plugins/tailwindcss/rules/<rule>.ts`** (10 new files) — port each
   rule. Keep its `meta` (type, docs, messages, schema, fixable,
   hasSuggestions, defaultOptions) and its behavior the same, and add
   `meta.languages: ["css/css"]`. Import helpers, types and the syntax from
   U1's files. The first line is
   `// Ported from @poupe/eslint-plugin-tailwindcss v0.3.1 (MIT),
   src/rules/<rule>.ts.`
   Convert to this repo's conventions: `.js` import extensions, `import type`
   for type-only imports, strict TS.
2. **`src/plugins/tailwindcss/rules/group-a.ts`** (new) — export
   `groupARules`, an object that maps each of the 10 rule names (without the
   `tailwindcss/` prefix) to its rule definition.
3. **``tests/unit/plugins/tailwindcss/rules/<rule>.test.ts``** (10 new files) —
   one test per rule with ESLint``s ``RuleTester``(from``eslint``). Each test
   file starts with the source header line of its upstream test path (D5).
   This repo has no vitest globals, so each file
   imports ``describe``, ``it``from``vitest``and sets``RuleTester.describe =
   describe``, ``RuleTester.it = it``and``RuleTester.itOnly = it.only``before it
   calls``run``. Use no shared helper file.
   Cases ported from the upstream test keep the upstream config exactly
   (upstream uses ``{ language: "css/css", plugins: { css } }``with our rule
   registered as``tailwindcss``, and no ``tolerant``or``customSyntax``unless the
   upstream case sets them). New cases use the config of the css
   preset:``plugins: { css, tailwindcss: { rules: groupARules } }``, ``language:
   "css/css"``and``languageOptions: { tolerant: true, customSyntax:
   tailwindSyntax }``. ``css``is the default export of``@eslint/css``. Import
   from ``../../../../../src/plugins/tailwindcss/...js``, as the other unit
   tests
   import from ``src/``. Port every valid and
   invalid case of the upstream test, with its message ids, locations
   and ``output``. For ``no-arbitrary-value-overuse`, write cases for each
   message
   and each option from the rule's source.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build` passes, then
  `pnpx vitest run tests/unit/plugins/tailwindcss/rules` passes for the 10
  test files of this unit.
- `node --input-type=module -e` that imports
  `./dist/plugins/tailwindcss/rules/group-a.js` prints the 10 rule names, each
  with `meta.languages` equal to `["css/css"]`.
- Each rule file starts with the source header line.

## Guardrails

- Do not edit any file in `src/plugins/tailwindcss/` that U1 created. If a
  rule needs a helper that U1 did not port, write it in the rule file and
  report it as `DECIDED:`. In a team, tell U3 so that it does not write the
  same helper a second time.
- Do not create `src/plugins/tailwindcss/index.ts` or `rules/group-b.ts`.
- Do not edit `package.json`, `pnpm-lock.yaml` or any preset.
- A rule must not change behavior. If an upstream test fails against the
  ported rule because of a difference between the upstream test setup and
  ours, return a QUESTION. Do not change the expected result.
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): port the tailwind rules consistent-spacing to
no-invalid-properties`
