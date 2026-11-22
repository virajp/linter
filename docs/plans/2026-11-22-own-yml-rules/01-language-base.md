# U1 — YAML language, source code, utils and test fixtures

- **Read first:** at tag `v3.10.0` of `ota-meshi/eslint-plugin-yml`:
  `src/language/*.ts`, `src/utils/*.ts`, `src/meta.ts`, `src/types.ts`,
  `tests/utils/utils.ts`, `tests/utils/apply-fixer.ts`,
  `tests/src/language/*.ts`. Read each with
  `gh api "repos/ota-meshi/eslint-plugin-yml/contents/<path>?ref=v3.10.0" --jq
  .content | base64 -d`.
  Also `THIRD_PARTY_NOTICES.md` and one test under
  `tests/unit/plugins/tailwindcss/` (plan 1), for the conventions.
- **Lazy-load:** `node_modules/yaml-eslint-parser/lib/`,
  `node_modules/@eslint/plugin-kit/dist/`, `.config/pre-commit-config.yaml`.

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

> D1 — Credit the MIT code in THIRD_PARTY_NOTICES.md plus a one-line source
> header in each ported file, test files included (plan 1 D5). Put the code
> in src/plugins/yml/ inside this package (plan 1 D7).

> D2 — Keep yaml-eslint-parser. Add @eslint/plugin-kit,
> @ota-meshi/ast-token-store, natural-compare, diff-sequences and
> escape-string-regexp as direct, exact-pinned, bundled dependencies.

> D4 — Upstream src/language/ (YAMLLanguage and YAMLSourceCode) becomes
> src/plugins/yml/language/. The plugin registers it as languages.yaml, so the
> language name stays yml/yaml.

> D5 — A RuleTester test for each rule, ported from the upstream test at tag
> v3.10.0 with the upstream config (plugins { yml: our plugin }, language
> yml/yaml) and the upstream fixture loader; plus the upstream language tests
> and the casing utils test, as D13 c and D14 limit them.

> D6 — Copy upstream tests/fixtures/rules/ at tag v3.10.0 to
> tests/unit/plugins/yml/fixtures/rules/, except the .vue files and their
> sidecars (D10, D15 c) and tests/fixtures/rules/vue-custom-block/ (D12);
> yaml-test-suite/ and integrations/ are not copied (D14, D15 b). Port the
> upstream loader (tests/utils/utils.ts without makeSuiteTests, and
> apply-fixer.ts) to tests/unit/plugins/yml/helpers/. Widen the pre-commit
> exclude from ^tests/fixtures/ to ^tests/(.*/)?fixtures/ in
> .config/pre-commit-config.yaml and in .config/bootstrap/tools.toml (D15 a).

> D15 — (a) U1 also owns .config/bootstrap/tools.toml and widens
> [tools.pre-commit] exclude to ^tests/(.*/)?fixtures/. (b) U1 copies only
> tests/fixtures/rules/. (c) U1 skips the sidecar files of each .vue
> fixture: for an input <dir>/<stem>-input.vue, every <dir>/<stem>-* file.

> D10 — Do not copy the .vue fixture files, and drop the vue-eslint-parser
> branch of the loader.

> D12 — Do not port vue-custom-block/no-parsing-error, its tests or its
> fixtures (upstream tests/fixtures/rules/vue-custom-block/).

> D14 — (a) U1 does not port directive-comments.ts; U5 ports it whole into
> with-rules.test.ts. (b) makeSuiteTests is dropped. (c) U1 ports
> tests/src/utils/casing.ts. (d) The tests of utils/rules.ts, meta.ts,
> eslint-plugin.ts and configs/ are not ported. (e) U1 copies only
> fixtures/rules/ (D15 b).

> D13 — (a) U1 does not port upstream src/utils/rules.ts. (b) The ported
> loadTestCases takes the plugin object as a parameter. (c) The test
> yaml-source-code-with-stylistic-rules is not ported. (d) natural-compare
> types come from a local declare module; JSON-schema types come from
> @eslint/core. (e) U5 keeps @eslint/plugin-kit out of --version. (f) The
> preset keeps files ["**/*.yaml", "**/*.yml"]. (g) The loader never writes
> a fixture.

## Edits

1. **`src/plugins/yml/language/`** — port upstream `src/language/index.ts`,
   `yaml-language.ts` and `yaml-source-code.ts`. Keep the behavior the same.
   Runtime imports stay `yaml-eslint-parser`, `@eslint/plugin-kit` and
   `@ota-meshi/ast-token-store`; type imports use `import type`.
2. **`src/plugins/yml/utils/`** — port upstream `src/utils/*.ts` except
   `rules.ts` (5 files; D13 a). Drop any part that exists only for Vue, and
   report each as `DECIDED:`. Take JSON-schema types from `@eslint/core`
   (for example `RulesMeta["schema"]`), never from `json-schema` (D13 d).
   Write `src/plugins/yml/natural-compare.d.ts` with a local
   `declare module "natural-compare"` that types its default export as
   `(a: string, b: string) => number` (D13 d).
3. **`src/plugins/yml/types.ts`, `src/plugins/yml/meta.ts`** — port upstream
   `src/types.ts` and `src/meta.ts`. In `meta.ts`, the name is `yml` and the
   version is this package's version, read the way
   `src/cli/commands/version.ts` reads it, or a constant if the rules only
   use `meta` for doc URLs; report the choice as `DECIDED:`.
4. **Header of each ported file** — the first line is
   `// Ported from eslint-plugin-yml v3.10.0 (MIT), <upstream path>.`
5. **`THIRD_PARTY_NOTICES.md`** — append a section for `eslint-plugin-yml`
   3.10.0: repository URL, the copyright line from the upstream `LICENSE` at
   `v3.10.0`, and the full MIT text in a fenced `text` block, the same shape as
   the sections that plan 1 wrote.
6. **`tests/unit/plugins/yml/fixtures/rules/`** — download the tarball with
   `gh api repos/ota-meshi/eslint-plugin-yml/tarball/v3.10.0 >
   <scratch>/yml.tgz`
   into a new, empty scratch directory, and extract it there. Copy its
   `tests/fixtures/rules/` tree here, byte for byte, with these exceptions:
   no `vue-custom-block/` directory (D12), no `.vue` file, and no sidecar of
   a `.vue` input (for `<dir>/<stem>-input.vue`, no `<dir>/<stem>-*` file;
   D15 c). Do not copy `yaml-test-suite/` or `integrations/` (D14 e,
   D15 b). Never retype a fixture. Also copy the upstream `package.json`
   at `v3.10.0`, byte for byte, to
   `tests/unit/plugins/yml/fixtures/upstream-package.json` (D16).
7. **`tests/unit/plugins/yml/helpers/`** — port `tests/utils/utils.ts` and
   `tests/utils/apply-fixer.ts`. The loader reads fixtures from
   `tests/unit/plugins/yml/fixtures/`. Drop the `vue-eslint-parser` import and
   every branch that handles `.vue` files. `loadTestCases` takes the plugin
   object as a parameter and imports no plugin index (D13 b). Drop
   `makeSuiteTests` (D14 b). Remove every
   path that writes a fixture: a missing `errors.json` or output file fails
   the test (D13 g).
8. **`tests/unit/plugins/yml/language/`** — port 4 upstream language tests
   (`token-store`, `yaml-language`, `yaml-source-code`,
   `yaml-source-code-with-core-rules`),
   one `.test.ts` file each. Do not port
   `yaml-source-code-with-stylistic-rules.ts`: it needs
   `@stylistic/eslint-plugin` (D13 c). Do not port `directive-comments.ts`
   either: U5 ports it (D14 a). Port `tests/src/utils/casing.ts` as
   `casing.test.ts` in the same folder (D14 c). Build the plugin object they
   need from
   `src/plugins/yml/language/` directly (`{ languages: { yaml: new
   YAMLLanguage() } }`), because the plugin index does not exist yet. Where a
   language test needs a rule that U2 to U4 port, leave that case out and
   report it as `DECIDED:`; U5 adds it. Keep each ported case's config and
   assertion as upstream has them. Connect `RuleTester` to vitest in each file
   as plan 1's tests do.
9. **`.config/pre-commit-config.yaml`** — change the global `exclude` from
   `(^|/)\.config/mise/locks/|^tests/fixtures/` to
   `(^|/)\.config/mise/locks/|^tests/(.*/)?fixtures/`. Change nothing else.
10. **`.config/bootstrap/tools.toml`** — change `[tools.pre-commit]`
    `exclude = [ "^tests/fixtures/" ]` to `exclude = [ "^tests/(.*/)?fixtures/"
    ]`
    (D15 a). Change nothing else.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit/plugins/yml/language`
  passes.
- `command find tests/unit/plugins/yml/fixtures -name '*.vue' | wc -l`
  prints `0`, and `tests/unit/plugins/yml/fixtures/rules/vue-custom-block`
  does not exist.
- `grep -rn "vue-eslint-parser" src/ tests/unit/plugins/yml` returns nothing.
- `mise x -- pre-commit run --config .config/pre-commit-config.yaml --files
  tests/unit/plugins/yml/fixtures/<any invalid .yaml fixture>`
  reports every hook as skipped (no files to check), and the file does not
  change. Stage nothing.

## Guardrails

- Do not create `src/plugins/yml/index.ts` or any file in
  `src/plugins/yml/rules/`.
- Do not edit `package.json`, `pnpm-lock.yaml` or any preset. The packages
  resolve through the hoisted `node_modules` until U5 lists them.
- Put no upstream file under `tests/fixtures/`: `smoke.mjs` and the golden
  lint test lint every file there.
- Never run a bare `dprint fmt`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D17).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): add the yaml language and test fixtures of our yml plugin`
