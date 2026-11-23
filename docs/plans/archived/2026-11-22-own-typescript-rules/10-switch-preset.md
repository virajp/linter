# U10 — Create the typescript plugin index, switch the typescript preset to it, and change the dependencies

- **Read first:** every owned file. The rule registries `group-a.ts` to
  `group-h.ts`, `src/plugins/typescript/meta.ts`, `src/plugins/astro/index.ts`
  (the index shape). The
  recommended config as it resolves now, **before** step 3:
  `node --input-type=module -e 'const t=(await
  import("typescript-eslint")).default;
  console.log(JSON.stringify(t.configs.recommended.map(c=>({name:c.name,files:c.files,languageOptions:c.languageOptions&&Object.keys(c.languageOptions),rules:c.rules})),null,2))'`.
- **Lazy-load:** `tests/golden/config.test.ts`,
  `src/config/presets/markdown-code-blocks.ts`.

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

> D2 — Keep @typescript-eslint/parser (the user's ruling of 2026-11-22). Its
> tree (typescript-estree, scope-manager, types, visitor-keys) stays, and
> so does the peer typescript >=4.8.4 <6.1.0 and the typescript 6.x hold,
> until typescript-eslint supports TypeScript 7 (typescript-estree 8.73.0
> already has an optional peer @typescript/native). TypeScript 7.0.2 ships
> only an unstable/* API, not the classic compiler API that
> typescript-estree needs.

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

> D8 — In the typescript preset. The plugin index (U10) exports meta and rules
> (merged from rules/group-a.ts to group-h.ts); no configs. The preset
> reproduces tseslint.configs.recommended exactly: its base entry (the
> @typescript-eslint/parser and sourceType module), its eslint-recommended
> entry (the core rules it turns off for TypeScript files), and its
> recommended entry: the 20 @typescript-eslint/ rules with their
> severities plus the core rules no-array-constructor,
> no-unused-expressions and no-unused-vars turned off; plus the preset's
> own globals, js.configs.recommended, and its own rule overrides. The
> plugin is registered as @typescript-eslint; the old alias key tseslint
> is dropped. After U10, the golden snapshots do not change at all; any
> golden change stops the run with a QUESTION.

> D9 — Plan 5 (its D10 and D11 d) already narrows the /^@typescript-eslint\//
> pattern of the --version plugin list so that it lists
> @typescript-eslint/parser and not @typescript-eslint/types; U10 keeps
> that, makes sure that the new direct @typescript-eslint/ packages
> (utils, type-utils, scope-manager, visitor-keys) are not listed either,
> and removes the /^typescript-eslint$/ pattern, which is dead once
> typescript-eslint leaves package.json. In
> .config/mise/tasks/p/upgrade.py and .github/workflows/deps-update.yml,
> the typescript hold stays; its comment names @typescript-eslint/parser
> (peer typescript <6.1) as the reason, in place of typescript-eslint. The
> two hold lists stay the same.

## Edits

1. **`src/plugins/typescript/index.ts`** (new) — export default
   `{ meta, rules: { ...groupARules, ..., ...groupHRules } }`, typed with
   `ESLint.Plugin`. No `configs`.
2. **`src/config/presets/typescript.ts`** — remove the `typescript-eslint`
   import. Write the config that D8 names, with
   `plugins: { js, "@typescript-eslint": <our plugin> }`,
   `languageOptions.parser` from `@typescript-eslint/parser`, and
   `name: "typescript"`. Keep the comment-free rule overrides as they are.
3. **Change the dependencies**, through `mise x --`:
   `pnpm remove typescript-eslint` (D4); then
   `pnpm add --save-exact @typescript-eslint/utils@8.73.0
   @typescript-eslint/type-utils@8.73.0 @typescript-eslint/scope-manager@8.73.0
   @typescript-eslint/visitor-keys@8.73.0 ts-api-utils@<v>
   @eslint-community/regexpp@<v>`,
   each `<v>` the version that `pnpm-lock.yaml` resolves today. Put the 6
   packages in `bundledDependencies`, and remove `typescript-eslint` from it. If
   the commands remove other packages from `node_modules`, run
   `mise x -- pnpm install --frozen-lockfile`.
4. **`src/cli/commands/version.ts`** — narrow the pattern per D9.
5. **`.config/mise/tasks/p/upgrade.py`, `.github/workflows/deps-update.yml`** —
   reword the `typescript` hold comment per D9, and add `"!ajv"` and
   `"!@types/react"` to both `pnpm update` lines, with a comment each (D14 c).
   Keep both hold lists the same.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit tests/integration`
  passes (the peers test included).
- `pnpx vitest run tests/golden` passes with no change (D8).
- `typescript-eslint` is in neither `dependencies` nor `bundledDependencies`
  of `package.json`, and `grep -rn 'from "typescript-eslint"' src/` returns
  nothing (D14 b).
- `node dist/index.js --version` lists `@typescript-eslint/parser` and no
  other `@typescript-eslint/` package.

## Guardrails

- Never edit `pnpm-lock.yaml` by hand.
- Do not run `vitest --update`.
- Do not edit a rule file, a registry or the utils. If a golden difference
  comes from a rule, return a QUESTION.
- Do not edit `CLAUDE.md` or `readme.md`. Report stale passages as
  `DOCS FALSIFIED:`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(deps): use our own typescript rules`
