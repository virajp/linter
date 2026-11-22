# U12 — Docs

- **Read first:** `CLAUDE.md`, `readme.md`, and every `DOCS FALSIFIED:` line
  that U1 to U10 returned.
- **Lazy-load:** the vwf `docs-sync` skill file, `docs/memory/decisions/`.

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

> D3 — 128 rules of @typescript-eslint/eslint-plugin 8.73.0 (137 rules
> upstream; the local node_modules showed a stale 8.72.1 with 136): all
> except the 9 deprecated (no-empty-interface, no-loop-func,
> no-loss-of-precision, no-restricted-imports, no-type-alias,
> no-var-requires, prefer-ts-expect-error, sort-type-constituents,
> typedef). 64 of them need type information (with
> no-unsafe-class-instance-assignment, new in 8.73.0); they work when a
> consumer turns on parserOptions.projectService or project, which the
> preset never does.

## Edits

1. Run `vwf:docs-sync` over the branch delta of this run, and apply its
   findings plus every `DOCS FALSIFIED:` line.
2. **`CLAUDE.md`** — the "Dependency policy" hold of `typescript`: its reason
   is now `@typescript-eslint/parser` (peer `typescript <6.1`), not
   `typescript-eslint`. The paragraph on `typescript` as a real dependency:
   it is now needed by the parser and by the ported rules. Any passage that
   names `typescript-eslint` or `@typescript-eslint/eslint-plugin` as a
   dependency. Add the holds of `ajv` (6.x, the ajv-6 API of the
   `areOptionsValid` test helper) and `@types/react` (18.x, the fixture
   typing) to the "Dependency policy" (D14 c).
3. **`readme.md`** — any passage that names the removed packages.
4. **`docs/memory/decisions/2026-11-22-own-typescript-rules.md`** (new) — a
   decisions doc per the vwf memory rule, with D1 to D14 of this plan in one
   line each. Add one line that B08 is complete: the linter owns the rules of
   every third-party plugin, and the parsers stay as dependencies.

## Verification

- `grep -rn "typescript-eslint\b" CLAUDE.md readme.md` returns no passage
  that names the removed meta package as a dependency.
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` pass.

## Guardrails

- Edit only docs.
- Write in ASD-STE100 Simplified Technical English, as the repo's other docs.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`docs: describe our own typescript rules and the end of B08`
