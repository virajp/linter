# U1 — TOML language, source code, utils and test fixtures

- **Read first:** at tag `v1.5.0` of `ota-meshi/eslint-plugin-toml`:
  `src/language/*.ts`, `src/utils/*.ts` (not `rules.ts`), `src/meta.ts`,
  `src/types.ts`, `tests/utils/utils.ts`, `tests/utils/apply-fixer.ts`,
  `tests/src/language/*.ts`, `tests/src/utils/casing.ts`, `LICENSE`. Read
  each with `gh api
  "repos/ota-meshi/eslint-plugin-toml/contents/<path>?ref=v1.5.0" --jq .content
  | base64 -d`.
  Also `src/plugins/yml/` and `tests/unit/plugins/yml/` (plan 2), which
  have the same structure, and `THIRD_PARTY_NOTICES.md`.
- **Lazy-load:** `node_modules/toml-eslint-parser/lib/`.

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

> D1 — Keep the toml/ namespace. Credit the MIT code in
> THIRD_PARTY_NOTICES.md plus a one-line source header in each ported file,
> test files included. Put the code in src/plugins/toml/. No Vue support.
> Each edit unit runs code:format --fix before it returns.

> D3 — Keep toml-eslint-parser; U4 makes it a direct dependency.

> D4 — src/language/ (index.ts, toml-language.ts, toml-source-code.ts) to
> src/plugins/toml/language/; src/utils/ except rules.ts (ast-utils.ts,
> bit.ts, casing.ts, index.ts) to src/plugins/toml/utils/; src/types.ts and
> src/meta.ts. Drop any part that exists only for Vue. JSON-schema types come
> from @eslint/core, never from json-schema.

> D5 — U1 copies upstream tests/fixtures/rules/ byte for byte to
> tests/unit/plugins/toml/fixtures/rules/, without vue-custom-block/ and
> space-eq-sign/; integrations/ is not copied. The loader (tests/utils/utils.ts
> without makeSuiteTests and without vue-eslint-parser, and apply-fixer.ts)
> goes to tests/unit/plugins/toml/helpers/; loadTestCases takes the plugin
> object as a parameter and never writes a fixture. U1 ports the language
> tests token-store, toml-language, toml-source-code and
> toml-source-code-with-core-rules, and tests/src/utils/casing.ts; cases that
> need a rule are left to U4.

## Edits

1. **`src/plugins/toml/language/`, `src/plugins/toml/utils/`,
   `src/plugins/toml/types.ts`, `src/plugins/toml/meta.ts`** — port the files
   that D4 names. Keep the behavior the same. Follow the conventions of
   `src/plugins/yml/`: `.js` import extensions, `import type` for
   type-only imports, strict TS. In `meta.ts`, the name is `toml`; use the
   same version source as `src/plugins/yml/meta.ts`.
2. **Header of each ported file** — the first line is
   `// Ported from eslint-plugin-toml v1.5.0 (MIT), <upstream path>.`
3. **`THIRD_PARTY_NOTICES.md`** — append a section for `eslint-plugin-toml`
   1.5.0: repository URL, `Copyright (c) 2021 Yosuke Ota`, and the full MIT
   text in a fenced `text` block, the same shape as the other sections.
4. **`tests/unit/plugins/toml/fixtures/rules/`** — download the tarball into
   a new, empty scratch directory, extract it there, and copy
   `tests/fixtures/rules/` here byte for byte, without `vue-custom-block/`
   and `space-eq-sign/`. Never retype a fixture.
5. **`tests/unit/plugins/toml/helpers/`** — port `tests/utils/utils.ts` and
   `apply-fixer.ts` per D5. Remove the `vue-eslint-parser` import, every
   `.vue` branch, `makeSuiteTests` and every `writeFileSync` path.
6. **`tests/unit/plugins/toml/language/`** — port the 4 language tests and
   `casing.test.ts` per D5, one `.test.ts` file each, with the source
   header. Build the plugin object from `src/plugins/toml/language/`
   directly (`{ languages: { toml: new TOMLLanguage() } }`). Leave out each
   case that needs a `toml/` rule, and list each in `DECIDED:`. Connect
   `RuleTester` to vitest in each file, as plan 2's tests do.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit/plugins/toml/language`
  passes.
- `tests/unit/plugins/toml/fixtures/rules/` has no `vue-custom-block` or
  `space-eq-sign` directory and no `.vue` file.
- `grep -rn "vue-eslint-parser\|writeFileSync" tests/unit/plugins/toml
  src/plugins/toml`
  returns nothing.

## Guardrails

- Do not create `src/plugins/toml/index.ts` or any file in
  `src/plugins/toml/rules/`.
- Do not edit `package.json`, `pnpm-lock.yaml` or any preset.
- Put no upstream file under `tests/fixtures/`.
- Never run a bare `dprint fmt`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): add the toml language and test fixtures of our toml plugin`
