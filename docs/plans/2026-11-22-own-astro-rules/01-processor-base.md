# U1 — Astro processor, shared code, utils and test fixtures

- **Read first:** at tag `v3.2.1` of `ota-meshi/eslint-plugin-astro`, the
  files that D4 names, `tests/utils/utils.ts`,
  `tests/utils/source-code-fixer.ts`,
  `tests/src/utils/string-literal-parser/index.ts` and `LICENSE`. Read each
  with `gh api "repos/ota-meshi/eslint-plugin-astro/contents/<path>?ref=v3.2.1"
  --jq .content | base64 -d`.
  Also `src/plugins/toml/` and `tests/unit/plugins/toml/` for the
  conventions.
- **Lazy-load:** `node_modules/astro-eslint-parser/`, `node_modules/synckit/`.

## Ruling

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

> D3 — Port eslint-plugin-astro (peers eslint >=10, typescript-eslint,
> @typescript-eslint/parser, eslint-plugin-jsx-a11y). Keep
> astro-eslint-parser 3.2.0 (native compiler; no peers). Add as direct,
> exact-pinned, bundled dependencies, at the versions installed today:
> postcss, postcss-selector-parser, synckit, @jridgewell/sourcemap-codec,
> @typescript-eslint/types (pinned with the other @typescript-eslint
> packages), @eslint-community/eslint-utils and espree (ESLint itself
> depends on these two). None has a peer that holds a core package back.
> @typescript-eslint/parser stays as it is; plan 6 decides it.

> D4 — At tag v3.2.1 of ota-meshi/eslint-plugin-astro: src/processor/
> (index.ts, astro/node.ts, astro/types.ts), src/shared/ (index.ts,
> client-script/index.ts, client-script/parse-expression.ts), src/utils/
> (all of it: ast-utils, fix-tracker, index, resolve-parser/,
> string-literal-parser/, style/, transform/ with the PostCSS worker
> postcss-worker.mts and the less, sass and stylus transforms),
> src/environments/index.ts, src/types.ts, src/meta.ts. Not ported:
> src/a11y/, src/configs/, src/esm-config-builder.ts, src/index.mts,
> src/plugin.ts (our plugin index replaces the last two),
> src/types-for-node.ts. The PostCSS worker stays a separate module that
> synckit loads from dist/; keep its file name and its .mts semantics as
> the build needs them, and report the choice as DECIDED.

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

## Edits

1. **`src/plugins/astro/processor/`, `shared/`, `utils/`, `environments/`,
   `types.ts`, `meta.ts`** — port the files that D4 names, in strict
   TypeScript, with the behavior unchanged. In `meta.ts`, the name is
   `astro`; use the same version source as `src/plugins/toml/meta.ts`. Make
   sure that the PostCSS worker resolves from `dist/` after `pnpm run build`
   (synckit loads it by path); report how as `DECIDED:`.
2. **Header of each ported file** — the first line is
   `// Ported from eslint-plugin-astro v3.2.1 (MIT), <upstream path>.`
3. **`THIRD_PARTY_NOTICES.md`** — append a section for `eslint-plugin-astro`
   3.2.1: repository URL, `Copyright (c) 2022 Yosuke Ota`, and the full MIT
   text in a fenced `text` block, the same shape as the other sections.
4. **`tests/unit/plugins/astro/fixtures/rules/`** — download
   `gh api repos/ota-meshi/eslint-plugin-astro/tarball/v3.2.1` into a new,
   empty scratch directory, extract it there, and copy
   `tests/fixtures/rules/` here byte for byte, without `jsx-a11y/`,
   `no-omitted-end-tags/` and `valid-compile/`. Never retype a fixture.
5. **`tests/unit/plugins/astro/helpers/`** — port `tests/utils/utils.ts` and
   `tests/utils/source-code-fixer.ts` per D5: no write path,
   `loadTestCases` takes the plugin object as a parameter.
6. **`src/plugins/astro/shims.d.ts`** — local `declare module` entries for
   `less`, `sass`, `stylus`, `postcss-load-config` and `source-map-js`, with
   only the types the transforms use (D11 c). In `utils/resolve-parser/`,
   load `@typescript-eslint/parser` and `espree` from this package, not from
   the consumer cwd; keep the consumer-local loading of the preprocessors
   (D6, D11 a). Do not copy the fixture files of the cases
   `no-unused-css-selector/invalid/style-lang01` to `06` (D13 a). Apply
   D13 b to `utils/resolve-parser/`.
7. **`tests/unit/plugins/astro/utils/string-literal-parser.test.ts`** — port
   `tests/src/utils/string-literal-parser/index.ts`, with the source header.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit/plugins/astro/utils`
  passes.
- `dist/plugins/astro/utils/transform/` holds the built PostCSS worker.
- `grep -rn "writeFileSync" tests/unit/plugins/astro` returns nothing.

## Guardrails

- Do not create `src/plugins/astro/index.ts` or any file in
  `src/plugins/astro/rules/`.
- Do not edit `package.json`, `pnpm-lock.yaml` or any preset.
- Put no upstream file under `tests/fixtures/`.
- Never run a bare `dprint fmt`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): add the processor and shared code of our astro plugin`
