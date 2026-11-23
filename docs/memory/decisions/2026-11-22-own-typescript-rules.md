DECISION 2026-11-22 ★4 | package:linter | own the @typescript-eslint/ rules
in src/plugins/typescript/, drop typescript-eslint, keep
@typescript-eslint/parser and the typescript 6.x hold | plan
docs/plans/2026-11-22-own-typescript-rules

# Own the TypeScript rules

Source: `docs/plans/2026-11-22-own-typescript-rules/index.json`, decisions D1
to D23. This is plan 6 of 6 of backlog item B08. D15 to D23 were decided
during the run.

## TypeScript plan

- **D1** ★3 | rulings from plans 1 to 5 | keep the `@typescript-eslint/`
  namespace (11 consumer configs override `no-explicit-any`); credit the MIT
  code in `THIRD_PARTY_NOTICES.md` and a one-line source header in each
  ported file, test files included; the code goes in
  `src/plugins/typescript/`, in strict TypeScript; the dependency criterion;
  no deprecated rules; each edit unit runs `code:format --fix` before it
  returns; a ported test may change its setup only, never its expected
  results | alt: a new namespace; a separate package — rejected
- **D2** ★4 | TypeScript parser | keep `@typescript-eslint/parser` and its
  tree, the peer `typescript >=4.8.4 <6.1.0` and the `typescript` 6.x hold,
  until typescript-eslint supports TypeScript 7; TypeScript 7.0.2 ships only
  an `unstable/*` API | alt: switch to oxc-parser; port typescript-estree —
  rejected
- **D3** ★3 | rules to port | 128 rules of `@typescript-eslint/eslint-plugin`
  8.73.0: all except the 9 deprecated; 64 need type information and work
  only when a consumer sets `parserOptions.projectService` or `project` |
  alt: the 64 untyped; only the 20 recommended — rejected
- **D4** ★4 | packages to keep and to port | remove `typescript-eslint` (and
  with it `@typescript-eslint/eslint-plugin`); keep `@typescript-eslint/parser`
  and `typescript`; add `@typescript-eslint/utils`, `type-utils`,
  `scope-manager`, `visitor-keys` (8.73.0), `ts-api-utils` and
  `@eslint-community/regexpp` as direct, exact-pinned, bundled dependencies |
  alt: port utils, type-utils or ts-api-utils — rejected
- **D5** ★2 | upstream source files to port | U1 ports `src/util/` and the
  shared rule helpers (`enum-utils/`, `naming-convention-utils/`,
  `prefer-optional-chain-utils/`); each rule unit ports its rule files; U10
  writes the plugin index; not `src/configs/` | alt: shared helpers inside
  the rule units — rejected
- **D6** ★2 | upstream tests and harness | the rule tests use
  `@typescript-eslint/rule-tester` 8.73.0 (exact-pinned devDependency),
  connected to vitest in each file; copy the 40 fixture files unchanged; port
  `RuleTester.ts` and the util tests; not the schema, docs, config and index
  tests | alt: convert to ESLint's RuleTester; port the docs tests — rejected
- **D7** ★1 | who changes `package.json` | U1 adds the test harness in wave 1,
  U10 changes the runtime dependencies in wave 3, each through pnpm | alt:
  the harness in U10 — rejected
- **D8** ★3 | rule configuration and parity proof | in the `typescript`
  preset; the plugin exports `meta` and `rules`, no configs, and registers as
  `@typescript-eslint`; the preset reproduces `tseslint.configs.recommended`
  exactly; the `tseslint` alias key is dropped; the golden snapshots do not
  change | alt: configs in the plugin; keep the alias — rejected
- **D9** ★1 | `--version` and the hold comments | list only
  `@typescript-eslint/parser`, not the new `@typescript-eslint/` packages;
  remove the dead `typescript-eslint` pattern; the `typescript` hold comment
  names `@typescript-eslint/parser` (peer `typescript <6.1`) | alt: list every
  `@typescript-eslint` package — rejected
- **D10** ★1 | review unit and execution mode | one review unit after U10;
  teams, solo if a team cannot start | alt: wave review only; solo — rejected
- **D11** ★3 | release level | MINOR: the 9 deprecated rules are removed; the
  consumer configs override only `no-explicit-any` | alt: PATCH; MAJOR —
  rejected
- **D12** ★2 | typings, rule types, naming-convention types, areOptionsValid,
  test layout | port `typings/`; port the rule types to `rules-types.ts`; move
  the naming-convention types to `naming-convention-utils/types.ts`; port
  `areOptionsValid.ts` with `ajv` 6.15.0 and add `@types/react` 18.3.31 as
  devDependencies; keep the upstream test folder shape under
  `rules/group-X/` | alt: leave out the typings; stub the types; drop the
  cases; flatten the folders — rejected
- **D13** ★1 | disable comments for unknown rules, test timeouts | drop or
  rewrite the comment; a typed case that times out may get a longer timeout
  in its own file | alt: define the unknown rules; a repo-wide vitest config
  — rejected
- **D14** ★2 | strict-TS fixes, the U10 check, devDependency holds,
  naming-convention test types | fix type errors only with changes that have
  no runtime effect, `.js` extensions on relative imports; the U10 check
  asserts that `typescript-eslint` is not in `package.json` or imported in
  `src/`; hold `ajv` at 6.x and `@types/react` at 18.x in `p:upgrade` and
  `deps-update.yml`; the test imports the types from
  `naming-convention-utils/types.ts` | alt: runtime guards; let pnpm update
  bump them; a re-export — rejected
- **D23** ★2 | the `export *` of `@typescript-eslint/utils/ast-utils` |
  `src/plugins/typescript/util/astUtils.ts` re-exports its 62 runtime names
  one by one (with `export type *`), because the export-star interop of jiti
  throws `Cannot redefine property` in the self-lint; examine the list again
  on each `@typescript-eslint/utils` upgrade | alt: the same in
  `util/index.ts`; lint `dist/` in the self-lint — rejected
- **B08** ★4 | backlog item complete | the linter owns the rules of every
  third-party plugin (Tailwind, YAML, TOML, HTML, Astro, TypeScript); the
  parsers stay as dependencies
