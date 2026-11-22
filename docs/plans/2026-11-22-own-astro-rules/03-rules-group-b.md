# U3 — Astro rules, group B (no-set-text-directive to sort-attributes)

- **Read first:** for each of the 9 rules below, `src/rules/<rule>.ts` and
  `tests/src/rules/<rule>.ts` at tag `v3.2.1` of
  `ota-meshi/eslint-plugin-astro`. Read each with `gh api
  "repos/ota-meshi/eslint-plugin-astro/contents/<path>?ref=v3.2.1" --jq .content
  | base64 -d`.
  Also every file that U1 created.
- **Lazy-load:** `tests/unit/plugins/astro/fixtures/rules/<rule>/`.

The 9 rules: `no-set-text-directive`, `no-unsafe-inline-scripts`,
`no-unused-css-selector`, `no-unused-define-vars-in-style`,
`prefer-class-list-directive`, `prefer-object-class-list`,
`prefer-split-class-list`, `semi`, `sort-attributes`.

## Ruling

> D14 — (a) A ported file may drop an eslint-disable or eslint-enable comment
> that names a rule this repo does not define, or rewrite it to the rule
> of this repo that it means; ESLint 10 reports an unknown rule in such a
> comment as an error, so code:lint would fail. (b) Where the repo's
> strict TypeScript (noUncheckedIndexedAccess, verbatimModuleSyntax, .js
> import extensions) rejects ported code, a unit fixes it only with
> changes that have no runtime effect: non-null assertions, casts, type
> annotations, import type, and .js or /index.js on relative imports. No
> runtime guard is added. List each kind of change as DECIDED. (Ruled for
> all B08 plans on 2026-11-22, from the rulings review of plan 6.)

> D13 — (a) All six preprocessor cases, no-unused-css-selector
> invalid/style-lang01 to style-lang06, are skipped with their fixture
> files (D11 b covers 06 too). (b) In utils/resolve-parser:
> @typescript-eslint/parser and espree come from this package (D6); the
> @babel/eslint-parser fallback stays consumer-local through
> requireUserLocal; the _ESLINT_PLUGIN_ASTRO_MODULES test hook is dropped;
> getInstalledParserId stays, reading the bundled parsers; the
> Module._cache lookup of ESLint own espree in espree.ts is replaced by a
> direct import of the bundled espree. (c) astro-client-js and
> astro-client-ts carry rules {}, so tests/unit/presets.test.ts holds. (d)
> U4 follows this order: 1 build and reproduce; 2 plugin index; 3 the
> astro preset, astro-client.ts, the registration and presets.test.ts; 4
> the dependency change; 5 version.ts; 6 the integration tests; 7 the
> regression test; 8 valid.astro; 9 the golden PATHS. (e) The ignore of
> **/*.astro in 95octane is out of scope: it is another repo, and the
> release is a separate hand step; it is a Parked follow-up.

> D11 — (a) utils/resolve-parser loads @typescript-eslint/parser and espree from
> this package (D6); the transforms keep loading sass, less, stylus and
> postcss-load-config from the consumer cwd (requireUserLocal), because
> they are the consumer own style toolchain and are not bundled. (b) The 5
> upstream no-unused-css-selector cases invalid/style-lang01..05 need
> those preprocessors and a postcss config; U3 does not port them and
> lists each as DECIDED, and U1 does not copy their fixture files. (c) U1
> writes src/plugins/astro/shims.d.ts with local declare module entries
> for less, sass, stylus, postcss-load-config and source-map-js (the types
> the transforms use); no package is added. (d) U4 narrows the
> /^@typescript-eslint\// pattern of src/cli/commands/version.ts so that
> @typescript-eslint/types is not listed and @typescript-eslint/parser
> still is. (e) U4 pins each new dependency at the version that
> pnpm-lock.yaml resolves today (for example postcss 8.5.33,
> postcss-selector-parser 7.2.1, @typescript-eslint/types 8.73.0), read
> from the lock file, not from a stale node_modules. (f) The golden PATHS
> entry is the fixed path file.astro/1.ts. (g) The ported
> client-typescript integration test imports @typescript-eslint/parser
> directly in place of upstream has-typescript-eslint-parser.ts.

> D1 — Keep the astro/ namespace and the processor name astro/client-side-ts.
> Credit the MIT code in THIRD_PARTY_NOTICES.md plus a one-line source
> header in each ported file, test files included. Put the code in
> src/plugins/astro/, in strict TypeScript. Dependencies follow the user's
> criterion: a direct dependency is not a concern; port what brings peer
> ranges or conflicting transitive trees. Deprecated rules are not ported.
> Each edit unit runs mise x -- mise run code:format --fix before it
> returns. Each test file connects RuleTester to vitest itself and imports
> from src/. A ported upstream test case that fails only because ESLint
> 10's RuleTester or the vitest wiring is stricter than upstream's setup —
> not because the rule behaves differently — may have its test setup
> changed (for example, remove a duplicate case, or add a property that
> ESLint 10 requires). Never change the expected messages, message ids,
> locations, output or suggestions. List each change as DECIDED; the
> review unit checks them. A case whose expected result differs stops the
> run with a QUESTION.

> D2 — 18 native rules of eslint-plugin-astro 3.2.1: all except the deprecated
> no-omitted-end-tags and valid-compile. The 36 jsx-a11y/* wrappers are
> not ported: they need eslint-plugin-jsx-a11y, a third-party plugin that
> this package never installed. The 9 rules that the preset enables are
> among the 18.

> D5 — U1 copies upstream tests/fixtures/rules/ byte for byte to
> tests/unit/plugins/astro/fixtures/rules/, without jsx-a11y/,
> no-omitted-end-tags/ and valid-compile/; tests/fixtures/integration/ is
> not copied (it serves tests/integration/test.ts, which installs packages
> from the network and is not ported). U1 ports tests/utils/utils.ts
> (without the write paths; loadTestCases takes the plugin object as a
> parameter; a missing errors or output file fails the test) and
> tests/utils/source-code-fixer.ts to tests/unit/plugins/astro/helpers/,
> and tests/src/utils/string-literal-parser/index.ts to
> tests/unit/plugins/astro/utils/. U2 and U3 port
> tests/src/rules/<rule>.ts for their rules. U4 ports these
> tests/src/integration/ files into tests/unit/plugins/astro/integration/:
> auto-parser, client-javascript, client-typescript,
> compat-with-eslint-json, eol-last, get-core-rule, linebreak-style,
> no-undef, no-unused-vars, parse-error; where upstream uses a config of
> the plugin, use our astro preset config. Not ported:
> a11y-plugin-loading, config-for-a11y, typescript-eslint-fallback,
> tests/src/config/, tests/src/meta.ts, tests/typing.test.ts,
> tests/integration/test.ts.

> D8 — One review unit after U4, because the change ships runnable code.
> Execution mode teams, because wave 2 has two edit units; if a team
> cannot start, the run uses solo.

## Edits

1. **`src/plugins/astro/rules/<rule>.ts`** (9 new files) — port each rule.
   Keep its `meta` and its behavior the same. Import from U1's files. The
   first line is
   `// Ported from eslint-plugin-astro v3.2.1 (MIT), src/rules/<rule>.ts.`
2. **`src/plugins/astro/rules/group-b.ts`** (new) — export `groupBRules`, an
   object that maps each of the 9 rule names (without the `astro/` prefix)
   to its rule definition.
3. **`tests/unit/plugins/astro/rules/group-b/<rule>.test.ts`** (9 new
   files) — port each upstream test with U1's loader. The first line is the
   source header with the upstream test path. The plugin object is
   `{ rules: groupBRules, processors: <U1's processors> }`, because the plugin
   index does not exist until U4; use the parser setup that the upstream test
   uses. Import from `../../../../../../src/plugins/astro/...js`.

   Do not port the cases `invalid/style-lang01` to `06` of
   `no-unused-css-selector`; list each as `DECIDED:` (D11 b, D13 a).

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run
  tests/unit/plugins/astro/rules/group-b`
  passes.
- Each rule file and each test file starts with the source header line.

## Guardrails

- Do not edit any file that U1 created. If a rule needs a helper that U1 did
  not port, write it in the rule file and report it as `DECIDED:`. In a
  team, tell U2.
- Do not create `src/plugins/astro/index.ts` or the other group registry.
- Do not edit `package.json`, `pnpm-lock.yaml`, a preset or a fixture.
- A rule must not change behavior. A case that fails only because ESLint 10
  or vitest is stricter may have its setup changed, never its expected
  result, and each change is listed as `DECIDED:` (D1). Any other failing
  upstream case returns a QUESTION.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): port the astro rules no-set-text-directive to sort-attributes`
