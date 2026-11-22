# U1 — TypeScript plugin utils, shared rule helpers, fixtures and test harness

- **Read first:** under `packages/eslint-plugin/` at tag `v8.73.0`:
  `src/util/`, `src/rules/enum-utils/`, `src/rules/naming-convention-utils/`,
  `src/rules/prefer-optional-chain-utils/`, `tests/RuleTester.ts`,
  `tests/util.test.ts`, and `LICENSE` at the repo root. Read each with
  `gh api
  "repos/typescript-eslint/typescript-eslint/contents/packages/eslint-plugin/<path>?ref=v8.73.0"
  --jq .content | base64 -d`.
  Also `src/plugins/astro/` and `tests/unit/plugins/astro/` for the
  conventions.
- **Lazy-load:** `node_modules/@typescript-eslint/utils/`,
  `node_modules/@typescript-eslint/rule-tester/`.

## Ruling

> D14 — (a) Upstream is built without noUncheckedIndexedAccess,
> noPropertyAccessFromIndexSignature and verbatimModuleSyntax, with
> extensionless or directory relative imports. A unit fixes the resulting
> type errors only with changes that have no runtime effect: non-null
> assertions, casts, type annotations, import type, and bracket access
> where the compiler asks for it. No runtime guard is added. Each relative
> import gets the .js extension, or /index.js for a directory. List the
> kinds of change in DECIDED. (b) The U10 check asserts that
> typescript-eslint is not in package.json (dependencies or
> bundledDependencies) and that no file in src/ imports from
> "typescript-eslint". (c) ajv (devDependency 6.15.0, the ajv-6 API that
> ESLint also uses) and @types/react (devDependency 18.3.31) are held at
> their majors: U10 adds "!ajv" and "!@types/react" to the pnpm update
> lines of .config/mise/tasks/p/upgrade.py and
> .github/workflows/deps-update.yml, with a comment each, and the two
> lists stay the same; U12 adds both holds to the Dependency policy of
> CLAUDE.md. (d) The ported naming-convention test
> (cases/createTestCases.ts) imports MessageIds and Options from
> rules/naming-convention-utils/types.ts; naming-convention.ts does not
> re-export them.

> D13 — (a) A ported file may drop an eslint-disable or eslint-enable comment
> that names a rule this repo does not define (for example
> @typescript-eslint/internal/*, eslint-plugin/*, unicorn/*), or rewrite
> it to the rule of this repo that it means; ESLint 10 reports an unknown
> rule in such a comment as an error, so code:lint would fail. Comments do
> not change behavior. List each change as DECIDED. (b) A typed RuleTester
> case that times out under the vitest default of 5000 ms may get a longer
> timeout in its own test file (upstream uses 10000 ms); this is a setup
> change under D1, listed as DECIDED.

> D12 — (a) U1 ports upstream packages/eslint-plugin/typings/typescript.d.ts and
> typings/eslint-rules.d.ts to src/plugins/typescript/typings/ (type
> declarations only; the ESLint 10 export map does not matter for them).
> (b) U1 ports the types of the package-root rules.d.ts (ESLintPluginDocs,
> ESLintPluginRuleModule and the types they need) to
> src/plugins/typescript/rules-types.ts and points the imports of
> util/createRule.ts and util/lazyRules.ts at it. (c) U1 moves the
> MessageIds and Options types of naming-convention into
> src/plugins/typescript/rules/naming-convention-utils/types.ts; U3's
> naming-convention.ts imports them from there; behavior is unchanged. (d)
> U1 ports tests/areOptionsValid.ts to
> tests/unit/plugins/typescript/helpers/areOptionsValid.ts and adds ajv
> 6.15.0 (the version that pnpm-lock.yaml resolves for ESLint's ajv
> ^6.14.0) as an exact-pinned devDependency; array-type keeps its 2 cases.
> (e) U1 adds @types/react 18.3.31 (the latest 18.x; upstream's catalog
> has ^18.3.21) as an exact-pinned devDependency, because the copied
> fixture tsconfigs name it. (f) The upstream test folders keep their
> shape under tests/unit/plugins/typescript/rules/group-X/<rule>/ (with
> cases/ where upstream has it); each test file uses the import depth of
> its own location.

> D1 — Keep the @typescript-eslint/ rule namespace (11 consumer configs
> override @typescript-eslint/no-explicit-any). Credit the MIT code in
> THIRD_PARTY_NOTICES.md plus a one-line source header in each ported
> file, test files included. Put the code in src/plugins/typescript/, in
> strict TypeScript. Dependencies follow the user's criterion: a direct
> dependency is not a concern; port what brings peer ranges or conflicting
> transitive trees. Deprecated rules are not ported. Each edit unit runs
> mise x -- mise run code:format --fix before it returns. Test files
> import from src/. A ported upstream test case that fails only because
> ESLint 10's RuleTester or the vitest wiring is stricter than upstream's
> setup — not because the rule behaves differently — may have its test
> setup changed (for example, remove a duplicate case, or add a property
> that ESLint 10 requires). Never change the expected messages, message
> ids, locations, output or suggestions. List each change as DECIDED; the
> review unit checks them. A case whose expected result differs stops the
> run with a QUESTION.

> D4 — Remove typescript-eslint (the only one of the two in package.json;
> @typescript-eslint/eslint-plugin is its transitive dependency and leaves
> with it). Keep @typescript-eslint/parser and typescript (both direct
> already). Add as direct, exact-pinned, bundled dependencies at the
> versions that pnpm-lock.yaml resolves: @typescript-eslint/utils,
> @typescript-eslint/type-utils, @typescript-eslint/scope-manager,
> @typescript-eslint/visitor-keys (all 8.73.0, the version of the parser),
> ts-api-utils, @eslint-community/regexpp. Their only peers are eslint and
> typescript <6.1 (the same as the kept parser) or typescript >=4.8.4
> (ts-api-utils); ESLint itself depends on regexpp. natural-compare is
> already direct (plan 2). ignore is not needed: only the deprecated
> no-restricted-imports uses it. The ported code may import
> eslint/use-at-your-own-risk.

> D5 — At tag v8.73.0 of typescript-eslint/typescript-eslint, under
> packages/eslint-plugin/: U1 ports src/util/ (all of it, with
> class-scope-analyzer/) and the shared rule helpers
> src/rules/enum-utils/, src/rules/naming-convention-utils/ and
> src/rules/prefer-optional-chain-utils/, so that no rule unit depends on
> another. Each rule unit ports src/rules/<rule>.ts for its rules. U10
> writes the plugin index in place of src/index.ts and src/raw-plugin.ts.
> Not ported: src/configs/ (the preset reproduces the one config it
> needs), the deprecated rules.

> D6 — The rule tests use @typescript-eslint/rule-tester 8.73.0 as an
> exact-pinned devDependency: it is typescript-eslint's own harness, its
> peers are the same as the kept parser's, and it does not ship. Each test
> file connects it to vitest itself (RuleTester.afterAll, describe, it,
> itOnly from vitest, as its docs show). U1 copies tests/fixtures/ (40
> files: tsconfig projects for the typed tests) byte for byte to
> tests/unit/plugins/typescript/fixtures/, ports tests/RuleTester.ts
> (getFixturesRootDir and friends) to
> tests/unit/plugins/typescript/helpers/, and ports tests/util.test.ts and
> the 8 files of tests/util/ (getConstraintInfo, getValueOfLiteralType,
> getWrappedCode, getWrappingFixer, isConditionalTest, isNodeEqual,
> lazyRules, misc) to tests/unit/plugins/typescript/util/. Each rule unit
> ports tests/rules/<rule>.test.ts and the folders tests/rules/<rule>/ of
> its rules. Not ported: tests/schemas.test.ts (it needs prettier, which
> the dprint-only rule forbids, and
> @typescript-eslint/rule-schema-to-typescript-types, and writes schema
> snapshots), tests/rules/index.test.ts (it checks upstream's own
> registry), tests/docs-eslint-output-snapshots/, docs.test.mts,
> configs.test.ts, index.test.ts, areOptionsValid.test.ts (the helper
> areOptionsValid.ts is ported; D12 d), eslint-rules/,
> worksWithStringlyTypedExtends.test.ts (they test docs, configs or ESLint
> core rules).

> D7 — U1 adds the devDependency @typescript-eslint/rule-tester in wave 1, so
> that the rule tests can run in wave 2. U10 makes the runtime dependency
> changes in wave 3. The two never run in the same wave, and each runs
> pnpm, never a hand edit of the lock file. This is the one exception to
> the shared-file rule in this plan.

## Edits

1. **`src/plugins/typescript/util/`** and the three shared rule helper folders
   — port them per D5, with the behavior unchanged. Keep the imports of
   `@typescript-eslint/utils`, `type-utils`, `scope-manager`,
   `visitor-keys`, `ts-api-utils` and `typescript` as upstream has them;
   they resolve through `node_modules` until U10 lists them.
   1a. **`src/plugins/typescript/typings/`,
   `src/plugins/typescript/rules-types.ts`**
   — port `typings/typescript.d.ts`, `typings/eslint-rules.d.ts` and the
   types of the package-root `rules.d.ts` (D12 a, b). Point the imports of
   `util/createRule.ts` and `util/lazyRules.ts` at `rules-types.ts`. Move
   the `MessageIds` and `Options` types of `naming-convention` into
   `rules/naming-convention-utils/types.ts` (D12 c).
2. **`src/plugins/typescript/meta.ts`** — the name is `@typescript-eslint`;
   use the same version source as `src/plugins/astro/meta.ts`. If
   `util/createRule.ts` builds doc URLs, keep them pointing at
   typescript-eslint.io.
3. **Header of each ported file** — the first line is
   `// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), <upstream
   path>.`
   (the path under `packages/eslint-plugin/`).
4. **`THIRD_PARTY_NOTICES.md`** — append a section for
   `@typescript-eslint/eslint-plugin` 8.73.0: repository URL,
   `Copyright (c) 2019 typescript-eslint and other contributors`, and the full
   MIT text in a fenced `text` block.
5. **The test harness (D7)** — run
   `mise x -- pnpm add --save-dev --save-exact
   @typescript-eslint/rule-tester@8.73.0 ajv@6.15.0 @types/react@18.3.31`
   (D12 d, e). Change nothing else in `package.json`.
6. **`tests/unit/plugins/typescript/fixtures/`** — download
   `gh api repos/typescript-eslint/typescript-eslint/tarball/v8.73.0` into a
   new, empty scratch directory, extract it there, and copy
   `packages/eslint-plugin/tests/fixtures/` here byte for byte.
7. **`tests/unit/plugins/typescript/helpers/`** — port `tests/RuleTester.ts`
   (`getFixturesRootDir` and the other helpers) so that it points at the
   fixtures folder of step 6, and `tests/areOptionsValid.ts` to
   `helpers/areOptionsValid.ts` (D12 d).
8. **`tests/unit/plugins/typescript/util.test.ts`** and
   **`tests/unit/plugins/typescript/util/`** — port `tests/util.test.ts` and
   the 8 files of `tests/util/` (D6), each with the source header.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run
  tests/unit/plugins/typescript/util.test.ts tests/unit/plugins/typescript/util`
  passes.
- `git diff package.json` shows only the 3 new exact-pinned
  devDependencies `@typescript-eslint/rule-tester`, `ajv` and `@types/react`.

## Guardrails

- Do not create `src/plugins/typescript/index.ts` or any rule file.
- Do not edit any preset.
- Never edit `pnpm-lock.yaml` by hand.
- Never run a bare `dprint fmt`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): add the utils and test harness of our typescript plugin`
