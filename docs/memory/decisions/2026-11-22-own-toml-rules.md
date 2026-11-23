DECISION 2026-11-22 ★4 | package:linter | own the toml/ rules and the
toml/toml language in src/plugins/toml/, drop eslint-plugin-toml, keep
toml-eslint-parser | plan docs/plans/2026-11-22-own-toml-rules

# Own the TOML rules and language

Source: `docs/plans/2026-11-22-own-toml-rules/index.json`, decisions D1 to
D13. This is plan 3 of 6 of backlog item B08. D11 to D13 were decided during
the run.

## TOML plan

- **D1** ★3 | rulings from plans 1 and 2 | keep the `toml/` namespace; credit
  the MIT code in `THIRD_PARTY_NOTICES.md` and a one-line source header in
  each ported file, test files included; the code goes in
  `src/plugins/toml/`; the dependency criterion of plan 2 D2; no Vue support;
  each edit unit runs `code:format --fix` before it returns | alt: a new
  namespace; a separate package; Vue support — rejected
- **D2** ★3 | rules to port | 22 rules of `eslint-plugin-toml` 1.5.0: all
  except the Vue-only rule `vue-custom-block/no-parsing-error` and the
  deprecated rule `space-eq-sign` (replaced upstream by `key-spacing`) | alt:
  23 with the deprecated rule; all 24 — rejected
- **D3** ★4 | packages to keep and to port | remove `eslint-plugin-toml`
  (peer `eslint >=9.38.0`); add `toml-eslint-parser` 1.0.3 as a direct,
  exact-pinned, bundled dependency (one dependency, `eslint-visitor-keys
  ^5.0.0`, which ESLint pins as `^5.0.1`; no peers) | alt: port
  `toml-eslint-parser` — rejected
- **D4** ★3 | upstream source files to port | `src/language/`,
  `src/utils/` without `rules.ts`, `src/types.ts` and `src/meta.ts`; the group
  registries and the plugin index replace `utils/rules.ts`; no Vue-only part;
  JSON-schema types from `@eslint/core`; the language is `languages.toml`, so
  its name stays `toml/toml` | alt: port `utils/rules.ts`; keep the plugin for
  its language — rejected
- **D5** ★3 | test bar and upstream tests | a RuleTester test for each of the
  22 rules from the upstream test at tag v1.5.0; upstream
  `tests/fixtures/rules/` copied to `tests/unit/plugins/toml/fixtures/rules/`
  without `vue-custom-block/` and `space-eq-sign/`; the loader in
  `helpers/` takes the plugin as a parameter and never writes a fixture; the
  language tests and the casing test ported, `directive-comments` in
  `with-rules.test.ts`, `rules-without-vue-eslint-parser` in
  `rules-on-js.test.ts`; no stylistic-rules, `meta`, `eslint-plugin`,
  `configs` or `utils/rules` tests | alt: golden snapshots only; port every
  upstream test — rejected
- **D6** ★3 | rule configuration and parity proof | in the `toml` preset; the
  plugin exports `meta`, `rules` and `languages { toml }`, no configs; the
  preset copies the upstream recommended config without the Vue-only rule;
  golden `lint/problems.json` and `lint/fixes.json` do not change, and
  `config/file.toml.json` changes only by the removed Vue-only rule | alt:
  configs in the plugin; accept any golden change — rejected
- **D7** ★1 | review unit and execution mode | one review unit after U4;
  teams, solo if a team cannot start | alt: wave review only; solo — rejected
- **D8** ★3 | release level | MINOR: the Vue-only rule and the deprecated rule
  `space-eq-sign` are removed; no consumer config names either (scan of
  `~/Projects`, 2026-11-22) | alt: PATCH; MAJOR — rejected
- **D9** ★3 | ported test that fails only from stricter ESLint 10 or vitest |
  change the test setup only, never the expected results; ruled for all B08
  plans | alt: ask for each case; one plan only — rejected
- **D10** ★2 | unknown-rule disable comments and strict-TS errors in ported
  code | drop or rewrite the comment; fix TS errors only with changes that have
  no runtime effect; ruled for all B08 plans | alt: define the unknown rules;
  add runtime guards — rejected
- **D11** ★1 | unused `@typescript-eslint/no-unsafe-function-type` disable
  comment in the ported `utils/ast-utils.ts` | keep it as ported; the warning
  does not fail `code:lint` | alt: drop the comment — rejected
- **D12** ★1 | self-lint `no-useless-assignment` in the ported
  `array-bracket-newline.ts` | an `eslint-disable-next-line` comment; the code
  stays identical to upstream | alt: remove the assignment; keep `code:lint`
  red — rejected
- **D13** ★1 | unused `@typescript-eslint/no-explicit-any` disable comment in
  the ported `array-element-newline.ts` | keep it as ported, as D11 | alt: drop
  the comment — rejected
