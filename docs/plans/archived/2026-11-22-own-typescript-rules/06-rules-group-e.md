# U6 — TypeScript rules, group E (no-unnecessary-condition to no-unsafe-enum-comparison)

- **Read first:** for each of the 16 rules below, `src/rules/<rule>.ts` and
  `tests/rules/<rule>.test.ts` (or the folder `tests/rules/<rule>/`) under
  `packages/eslint-plugin/` at tag `v8.73.0`. Read each with `gh api
  "repos/typescript-eslint/typescript-eslint/contents/packages/eslint-plugin/<path>?ref=v8.73.0"
  --jq .content | base64 -d`.
  Also every file that U1 created.
- **Lazy-load:** `tests/unit/plugins/typescript/fixtures/`.

The 16 rules: `no-unnecessary-condition`,
`no-unnecessary-parameter-property-assignment`, `no-unnecessary-qualifier`,
`no-unnecessary-template-expression`, `no-unnecessary-type-arguments`,
`no-unnecessary-type-assertion`, `no-unnecessary-type-constraint`,
`no-unnecessary-type-conversion`, `no-unnecessary-type-parameters`,
`no-unsafe-argument`, `no-unsafe-assignment`, `no-unsafe-call`,
`no-unsafe-class-instance-assignment`, `no-unsafe-declaration-merging`,
`no-unsafe-enum-assignment`, `no-unsafe-enum-comparison`.

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

> D3 — 128 rules of @typescript-eslint/eslint-plugin 8.73.0 (137 rules
> upstream; the local node_modules showed a stale 8.72.1 with 136): all
> except the 9 deprecated (no-empty-interface, no-loop-func,
> no-loss-of-precision, no-restricted-imports, no-type-alias,
> no-var-requires, prefer-ts-expect-error, sort-type-constituents,
> typedef). 64 of them need type information (with
> no-unsafe-class-instance-assignment, new in 8.73.0); they work when a
> consumer turns on parserOptions.projectService or project, which the
> preset never does.

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

> D10 — One review unit after U10, because the change ships runnable code.
> Execution mode teams, because wave 2 has eight edit units; if a team
> cannot start, the run uses solo.

## Edits

1. **`src/plugins/typescript/rules/<rule>.ts`** (16 new files) — port each
   rule. Keep its `meta` (with `docs.requiresTypeChecking` and
   `docs.recommended`) and its behavior the same. Import from U1's files and
   from the kept packages. The first line is
   `// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT),
   src/rules/<rule>.ts.`
2. **`src/plugins/typescript/rules/group-e.ts`** (new) — export `groupERules`,
   an object that maps each of the 16 rule names (without the
   `@typescript-eslint/` prefix) to its rule definition.
3. **`tests/unit/plugins/typescript/rules/group-e/`** — port each upstream
   test file of the 16 rules (and each file of a test folder), with the
   source header, using `RuleTester` from `@typescript-eslint/rule-tester`
   connected to vitest in the file (D6), and U1's fixture helpers for typed
   cases. A test folder of upstream keeps its shape under
   `group-X/<rule>/` (D12 f); each file uses the import depth of its own
   location to reach `src/plugins/typescript/`.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then
  `pnpx vitest run tests/unit/plugins/typescript/rules/group-e` passes.
- Each rule file and each test file starts with the source header line.

## Guardrails

- Do not edit any file that U1 created. If a rule needs a helper that U1 did
  not port, write it in the rule file and report it as `DECIDED:`. In a
  team, tell U2, U3, U4, U5, U7, U8, U9.
- Do not create `src/plugins/typescript/index.ts` or another group registry.
- Do not edit `package.json`, `pnpm-lock.yaml`, a preset or a fixture.
- A rule must not change behavior. A case that fails only because ESLint 10
  or vitest is stricter may have its setup changed, never its expected
  result, and each change is listed as `DECIDED:` (D1). Any other failing
  upstream case returns a QUESTION.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): port the typescript rules no-unnecessary-condition to
no-unsafe-enum-comparison`
