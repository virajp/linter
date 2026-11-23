DECISION 2026-11-22 ★4 | package:linter | own the html/ rules and the
html/html language in src/plugins/html/, drop @html-eslint/eslint-plugin,
keep @html-eslint/{parser,core,template-parser}, @rviscomi/capo.js and
html-standard | plan docs/plans/2026-11-22-own-html-rules

# Own the HTML rules and language

Source: `docs/plans/2026-11-22-own-html-rules/index.json`, decisions D1 to
D16. This is plan 4 of 6 of backlog item B08. D15 and D16 were decided during
the run.

## HTML plan

- **D1** ★3 | rulings from plans 1 to 3 | keep the `html/` namespace (the
  `virajp.dev` config overrides `html/attrs-newline` and `html/use-baseline`);
  credit the MIT code in `THIRD_PARTY_NOTICES.md` and a one-line source header
  in each ported file, test files included; the code goes in
  `src/plugins/html/`; the dependency criterion; no Vue support; each edit
  unit runs `code:format --fix` before it returns | alt: a new namespace; a
  separate package — rejected
- **D2** ★4 | packages to keep and to port | port
  `@html-eslint/eslint-plugin` 0.68.0 (peer `eslint >=8.0.0 || ^10.0.0-0`);
  keep `@html-eslint/parser`, `@html-eslint/core`,
  `@html-eslint/template-parser` and `@rviscomi/capo.js` as direct,
  exact-pinned, bundled dependencies (no peers); `@html-eslint/types`,
  `es-html-parser` and `@types/estree` are devDependencies for type-only
  imports; the language uses our `@eslint/plugin-kit` 0.7.3 | alt: port the
  parser and core; keep the plugin — rejected
- **D3** ★3 | how to port the JavaScript | strict TypeScript; JSDoc types
  become TypeScript types; upstream `lib/types/*.ts` and
  `lib/languages/types.ts` as they are; same behavior | alt: vendor the JS
  with `allowJs` and `checkJs` — rejected
- **D4** ★3 | rules to port | 65 rules: all except the deprecated
  `no-extra-spacing-attrs`; the 18 rules of the preset are among them | alt:
  all 66; only the 18 enabled — rejected
- **D5** ★2 | HTML in JS template literals | port it: the template-literal
  util, the template branches of the rules and the template test cases | alt:
  drop it — rejected
- **D6** ★3 | upstream tests to port | the 65 rule tests (both testers), the
  rule-tester helper with the plugin as a parameter, the template-literal util
  test, the language tests and `inline-disable.test.js`; not `e2e/`,
  `configs.test.js` or `plugin/export.test.js` | alt: golden snapshots only;
  every test — rejected
- **D7** ★3 | rule configuration and parity proof | in the `html` preset; the
  plugin exports `meta`, `rules` and `languages { html }`, no configs; the
  preset copies the upstream recommended config and keeps its three overrides;
  the golden snapshots do not change | alt: configs in the plugin; accept
  golden changes — rejected
- **D8** ★1 | review unit and execution mode | one review unit after U6;
  teams, solo if a team cannot start | alt: wave review only; solo — rejected
- **D9** ★3 | release level | MINOR: the deprecated rule
  `html/no-extra-spacing-attrs` is removed; no consumer config names it (scan
  of `~/Projects`, 2026-11-22) | alt: PATCH; MAJOR — rejected
- **D10** ★2 | version list, `html-standard`, version drift, the indent
  folder, the gates commit | `--version` drops the `@html-eslint/` pattern;
  `html-standard` 0.0.13 is a direct bundled dependency; version drift of the
  kept packages is accepted with no hold; `rules/indent/` keeps three files;
  the gates unit makes no empty commit | alt: new `--version` lines; rely on
  hoisting; hold the kept packages; one indent file — rejected
- **D11** ★2 | e2e, parser mode, util test, `entities.json`, RuleTester
  wiring | no e2e port; `inline-disable` in language mode; the parser-mode
  code stays but no test uses it; `entities.json` becomes the generated module
  `data/entities.ts`; one shared helper wires RuleTester to vitest | alt: port
  e2e; parser mode in tests; `resolveJsonModule`; wiring in each file —
  rejected
- **D12** ★1 | parserOptions remap, `capo.d.ts`, `espree` | the helper keeps
  the parserOptions remap (amends D11 f); `capo.d.ts` is dropped because
  capo.js ships types; `espree` is an exact-pinned devDependency | alt: drop
  the remap; keep `capo.d.ts`; rely on hoisting — rejected
- **D13** ★3 | ported test that fails only from stricter ESLint 10 or vitest |
  change the test setup only, never the expected results; ruled for all B08
  plans | alt: ask for each case; one plan only — rejected
- **D14** ★2 | unknown-rule disable comments and strict-TS errors in ported
  code | drop or rewrite the comment; fix TS errors only with changes that have
  no runtime effect; ruled for all B08 plans | alt: define the unknown rules;
  add runtime guards — rejected
- **D15** ★1 | self-lint `no-useless-assignment` in the ported `indent.ts` |
  keep the upstream code and add `eslint-disable-next-line
  no-useless-assignment -- ported upstream code` | alt: change the code with
  no runtime effect — rejected
- **D16** ★2 | the pre-commit hook strips trailing spaces in ported test
  literals | write each trailing space as an escape (`\x20`, or `${" "}` in a
  template literal), so the tested strings stay the same as upstream | alt:
  raw spaces and a hook exclude for the html rule tests; stop the plan —
  rejected
