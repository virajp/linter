# U4 — Create the astro plugin index, switch the astro preset to it, fix TypeScript in client scripts, and change the dependencies

- **Read first:** every owned file. The rule registries, U1's processor and
  environments, `src/plugins/toml/index.ts` (the index shape), upstream
  `src/configs/flat/base.ts` and `src/configs/flat/recommended.ts` at
  `v3.2.1`, and the `tests/src/integration/` files that D5 names. The
  recommended config as it resolves now, **before** step 4.
- **Lazy-load:** `tests/golden/config.test.ts`,
  `src/config/presets/typescript.ts`,
  `src/config/index.ts`.

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

> D12 — (a) The virtual-file configs are required: ESLint skips a processor code
> block that no files pattern matches. U4 writes
> src/config/presets/astro-client.ts with two presets, name
> astro-client-js (files ["**/*.astro/*.js"]) and name astro-client-ts
> (files ["**/*.astro/*.ts"]), each with the languageOptions of upstream
> astro/base/javascript and astro/base/typescript at v3.2.1 (the browser
> globals; for TS, our bundled @typescript-eslint/parser and the
> parserOptions upstream sets), without prettier/prettier. (b) U4
> registers both in composeBaseConfig() (src/config/index.ts) right after
> the astro preset, and adds them to tests/unit/presets.test.ts; consumers
> can target them in overrides by these names; U6 adds them to the preset
> lists of CLAUDE.md and readme.md. (c) Where an upstream integration test
> uses configs.base, the ported test uses the same shape built from our
> plugin: the astro preset entry with rules {}, plus the two client
> presets; upstream expected messages then stay valid. Where it uses
> configs.recommended, use the astro preset entry as it is plus the two
> client presets. (d) U4 reproduces the bug with the worktree own build
> (pnpm run build) before step 2, run from a temp directory outside the
> repo; the temp directory is not a repo path and needs no owns entry.

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

> D6 — Yes (the user's ruling of 2026-11-22). Today a consumer repo gets
> 'Parsing error: Unexpected token as' on TypeScript in the client
>
> <script> of an .astro file; the frontmatter parses. The cause (rulings
> review, 2026-11-22): upstream's configs/has-typescript-eslint-parser.ts
> picks the processor by whether @typescript-eslint/parser resolves from
> process.cwd(); a consumer repo does not install it (this package bundles
> it), so upstream falls back to the processor astro/astro, whose script
> blocks espree parses. Inside this repo the parser resolves, so the bug
> does not show there. The fix: the preset sets processor
> astro/client-side-ts explicitly (D7), and the ported
> utils/resolve-parser loads @typescript-eslint/parser and espree from
> this package (the bundle), never from the consumer's cwd. U4 proves it
> with tests/unit/plugins/astro/client-script.test.ts, which runs from a
> temp directory outside the repo (realpathSync of a temp dir, as the
> golden lint test does), and with a TypeScript client script added to
> tests/fixtures/astro/valid.astro; smoke.mjs lints the fixtures from an
> install outside the repo.

> D7 — In the astro preset. The plugin index (U4) exports meta, rules (merged
> from rules/group-a.ts and group-b.ts), processors { "client-side-ts":
> <processor>, astro: <processor>, ".astro": <processor> } as upstream
> exports them, and environments; no configs. The preset reproduces
> flat/recommended without the jsx-a11y and prettier entries: the parser
> astro-eslint-parser with parserOptions { parser:
> @typescript-eslint/parser, extraFileExtensions [".astro"], sourceType
> module }, the globals (node and astro), the processor
> astro/client-side-ts set explicitly, the 9 astro/ rules, and
> no-unreachable off; the virtual-file configs are the two presets of D12
> a. After U4, lint/problems.json and lint/fixes.json may change only for
> tests/fixtures/astro/ files and only by the effect of the D6 fix;
> config/file.astro.json may change only by what D6 needs; the new
> snapshot config/file.astro__1.ts.json is expected. U4 adds
> file.astro/1.ts to the PATHS of tests/golden/config.test.ts. Any other
> golden change stops the run with a QUESTION.

> D10 — U4 narrows the /^@typescript-eslint\// pattern of the --version plugin
> list so that @typescript-eslint/types (D3) is not listed and
> @typescript-eslint/parser still is (D11 d); eslint-plugin-astro leaves
> the list because it leaves package.json.

## Edits

Do the steps in the order of D13 d: the build and the reproduction of step 3
first, then steps 1, 2, the rest of step 3, and 4 to 9.

1. **`src/plugins/astro/index.ts`** (new) — export default
   `{ meta, rules: { ...groupARules, ...groupBRules }, processors, environments
   }`
   as D7 names them, typed with `ESLint.Plugin`. No `configs`.
2. **`src/config/presets/astro.ts`** — remove the `eslint-plugin-astro`
   import. Write the config that D7 names, with `plugins: { astro: <our
   plugin> }` and `name: "astro"`. Keep the `@typescript-eslint/parser`
   import as it is (D3).
3. **The client-script fix (D6, D12)** — before step 2, run `pnpm run build`
   and reproduce the failure from a temp directory outside the repo: a
   `.astro` file with `as` in a client `<script>` gives
   `Parsing error: Unexpected token as` (D12 d). Then:
   - set the processor `astro/client-side-ts` explicitly in the astro preset
     (step 2);
   - write `src/config/presets/astro-client.ts` with the presets
     `astro-client-js` and `astro-client-ts` (D12 a);
   - register both in `composeBaseConfig()` in `src/config/index.ts`, right
     after the astro preset, and add both to `tests/unit/presets.test.ts`
     (D12 b). Both carry `rules: {}` (D13 c).
     Keep the preset name `astro` on the main entry.
4. **Change the dependencies**, through `mise x --`:
   `pnpm remove eslint-plugin-astro`; then
   `pnpm add --save-exact postcss@<v> postcss-selector-parser@<v> synckit@<v>
   @jridgewell/sourcemap-codec@<v> @typescript-eslint/types@<v>
   @eslint-community/eslint-utils@<v> espree@<v>`,
   each `<v>` the version that `pnpm-lock.yaml` resolves today (D11 e). Put the
   7 packages in `bundledDependencies`, and
   remove `eslint-plugin-astro` from it. If the commands remove other
   packages from `node_modules`, run `mise x -- pnpm install --frozen-lockfile`.
5. **`src/cli/commands/version.ts`** — change it only as D10 says.
6. **`tests/unit/plugins/astro/integration/`** — port the integration tests
   that D5 names, each with the source header. In place of upstream's
   configs, use the shapes of D12 c.
7. **`tests/unit/plugins/astro/client-script.test.ts`** (new) — the D6
   regression test: run the built CLI (`dist/index.js`) from a temp
   directory outside the repo (`realpathSync` of a temp dir) on a `.astro`
   file with TypeScript in the frontmatter and in a client script, and
   expect no fatal error. The ported `client-typescript` test imports
   `@typescript-eslint/parser` directly (D11 g).
8. **`tests/fixtures/astro/valid.astro`** — add a client `<script>` with
   TypeScript syntax (for example a type assertion and a typed variable) that
   lints clean. Keep the rest of the file.
9. **`tests/golden/config.test.ts`** — add the virtual path of a TypeScript
   client script of `file.astro` to `PATHS`: the fixed path
   `file.astro/1.ts` (D11 f).

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit tests/integration`
  passes.
- `node dist/index.js --no-ignore tests/fixtures/astro/valid.astro` reports
  no problem.
- `pnpx vitest run tests/golden` fails only in the ways D7 allows. Report
  the diff summary. U7 writes the snapshots again.
- `grep -rn "eslint-plugin-astro" src/config package.json` returns nothing.

## Guardrails

- Never edit `pnpm-lock.yaml` by hand.
- Do not run `vitest --update`.
- Do not edit a rule file, a registry, the processor or the utils. If a golden
  difference comes from a rule, return a QUESTION.
- Do not edit `CLAUDE.md` or `readme.md`. Report stale passages as
  `DOCS FALSIFIED:`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(deps): use our own astro rules and parse TypeScript in client scripts`
