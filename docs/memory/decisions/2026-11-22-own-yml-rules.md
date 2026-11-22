DECISION 2026-11-22 ★4 | package:linter | own the yml/ rules and the yml/yaml
language in src/plugins/yml/, drop eslint-plugin-yml, keep yaml-eslint-parser
| plan docs/plans/2026-11-22-own-yml-rules

# Own the YAML rules and language

Source: `docs/plans/2026-11-22-own-yml-rules/index.json`, decisions D1 to
D24. This is plan 2 of 6 of backlog item B08. D20 to D24 were decided during
the run.

## Rulings for all of B08

The later B08 plans (TOML, HTML, Astro, TypeScript) inherit these rulings.

- **D2** ★4 | dependency criterion | a direct dependency is not a concern,
  because we control its version; the problem is the transitive dependencies
  that conflict between direct dependencies. Port `eslint-plugin-yml` (peer
  `eslint >=9.38.0`, its own ranges on `@eslint/core` and
  `@eslint/plugin-kit`); keep `yaml-eslint-parser`; add
  `@eslint/plugin-kit`, `@ota-meshi/ast-token-store`, `natural-compare`,
  `diff-sequences` and `escape-string-regexp` as direct, exact-pinned, bundled
  dependencies (no peers; transitives none or already pinned by ESLint) |
  alt: port `yaml-eslint-parser`; port the small packages — rejected
- **D20** ★2 | the TypeScript `override` keyword that `noImplicitOverride`
  requires on a ported subclass method | allowed under D19 (b); ruled for all
  B08 plans | alt: keep D19 (b) closed — rejected

Other rulings of this plan also apply after it: **D18** and **D19** are ruled
for all B08 plans. The [YAML plan](#yaml-plan) section records them.

## YAML plan

- **D1** ★3 | rulings from plan 1 | keep the `yml/` namespace (plan 1 D2);
  credit the MIT code in `THIRD_PARTY_NOTICES.md` and a one-line source header
  in each ported file, test files included (plan 1 D5); the code goes in
  `src/plugins/yml/` (plan 1 D7) | alt: a new namespace; a separate package —
  rejected
- **D3** ★3 | rules to port | all 30 rules of `eslint-plugin-yml` 3.10.0,
  without the Vue-only rule (D12) | alt: the 7 enabled rules; the 16
  non-layout rules; all 31 — rejected
- **D4** ★4 | language | port upstream `src/language/` to
  `src/plugins/yml/language/`; the plugin registers it as `languages.yaml`, so
  the language name stays `yml/yaml` | alt: keep `eslint-plugin-yml` for its
  language — rejected
- **D5** ★3 | test bar | a RuleTester test for each rule from the upstream test
  at tag v3.10.0 with the upstream fixture loader, plus the upstream language
  tests and the casing test (as D13 c and D14 limit them); golden problems and
  fixes unchanged | alt: golden snapshots only — rejected
- **D6** ★3 | upstream fixtures | copy upstream `tests/fixtures/rules/` to
  `tests/unit/plugins/yml/fixtures/rules/`, without the `.vue` files and their
  sidecars and without `vue-custom-block/`; port the loader to
  `tests/unit/plugins/yml/helpers/`; widen the pre-commit exclude to
  `^tests/(.*/)?fixtures/` | alt: inline cases only; fetch the fixtures at test
  time — rejected
- **D7** ★3 | rule configuration | in the `yaml` preset; the plugin exports
  `meta`, `rules` and `languages { yaml }`, no configs; the preset copies the
  upstream `flat/recommended` config without the Vue-only rule | alt: configs
  inside our plugin — rejected
- **D8** ★3 | parity proof | golden `lint/problems.json` and `lint/fixes.json`
  do not change; the `file.yaml` and `file.yml` config snapshots change only
  in the parser field and by the removed Vue-only rule | alt: accept any
  golden change — rejected
- **D9** ★1 | review unit and execution mode | one review unit after U5; teams,
  solo if a team cannot start | alt: wave review only; solo — rejected
- **D10** ★2 | the 37 `.vue` fixtures | skip them and drop the
  `vue-eslint-parser` branch of the loader | alt: add `vue-eslint-parser` as a
  devDependency — rejected
- **D11** ★3 | release level | MINOR: the Vue-only rule
  `yml/vue-custom-block/no-parsing-error` is removed; the other 30 rules, the
  language name and the behavior stay the same | alt: PATCH; MAJOR — rejected
- **D12** ★3 | Vue-only rule `vue-custom-block/no-parsing-error` | not ported:
  the user does not use Vue; a YAML syntax error stays a fatal parse error of
  the language | alt: port it — rejected
- **D13** ★2 | ported files, wave order, types and tooling | no
  `utils/rules.ts` (the group registries and the plugin index replace it); the
  loader takes the plugin as a parameter; no
  `yaml-source-code-with-stylistic-rules` test (it needs
  `@stylistic/eslint-plugin`); a local `natural-compare.d.ts`, no `@types`
  package, JSON-schema types from `@eslint/core`; `@eslint/plugin-kit` is not
  in the `--version` plugin list; `files` stays
  `["**/*.yaml", "**/*.yml"]`; the loader never writes a fixture | alt: port
  `utils/rules.ts`; add `@stylistic/eslint-plugin`; add
  `@types/natural-compare`; list `@eslint/plugin-kit` in `--version` —
  rejected
- **D14** ★2 | upstream tests to port | `directive-comments` goes whole into
  `language/with-rules.test.ts` (it needs `yml/no-empty-key`); drop
  `makeSuiteTests`; port the casing test; no tests of `utils/rules.ts`,
  `meta.ts`, `eslint-plugin.ts` or `configs/`; copy only
  `tests/fixtures/rules/` | alt: port every upstream test file; copy all
  fixture directories — rejected
- **D15** ★2 | bootstrap exclude, suite fixtures and `.vue` sidecars | widen
  `[tools.pre-commit] exclude` in `.config/bootstrap/tools.toml` too; do not
  copy `yaml-test-suite/`; skip every `<stem>-*` sidecar of a `.vue` fixture |
  alt: accept the drift with bootstrap; copy `yaml-test-suite/`; copy the
  orphan sidecars — rejected
- **D16** ★1 | the `sort-keys` case that lints the upstream `package.json` |
  lint a byte-for-byte copy at
  `tests/unit/plugins/yml/fixtures/upstream-package.json` | alt: lint this
  repo's `package.json`; drop the case — rejected
- **D17** ★1 | formatting before the unit gate | each edit unit runs
  `code:format --fix` before it returns | alt: a `--fix` unit gate — rejected
- **D18** ★3 | ported test that fails only from stricter ESLint 10 or vitest |
  change the test setup only, never the expected results; ruled for all B08
  plans | alt: ask for each case; one plan only — rejected
- **D19** ★2 | unknown-rule disable comments and strict-TS errors in ported
  code | drop or rewrite the comment; fix TS errors only with changes that have
  no runtime effect; ruled for all B08 plans | alt: define the unknown rules;
  add runtime guards — rejected
- **D21** ★1 | self-lint `no-useless-assignment` in the ported
  `flow-sequence-bracket-newline.ts` | an `eslint-disable-next-line` comment;
  the code stays identical to upstream | alt: `let minItems: number;`; keep
  `code:lint` red — rejected
- **D22** ★1 | `max-len` has no `invalid/` fixture directory (its only upstream
  fixture was `.vue`) | the loader treats a missing `valid/` or `invalid/`
  directory as empty | alt: run only `valid/`; a placeholder `.gitkeep` —
  rejected
- **D23** ★1 | 3 `sort-keys` output tests failed because vitest deferred the
  `skipOutputTest` filter past the delete | the loader computes the filtered
  list before the `describe` | alt: pass `skipOutputTest` in the test; leave
  the failures — rejected
- **D24** ★1 | `new RuleTester({})` in ported rule tests | keep it where
  upstream has it, so the port stays a line-for-line copy | alt: always pass
  `plugins` and `language` — rejected
