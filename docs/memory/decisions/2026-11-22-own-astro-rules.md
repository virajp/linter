DECISION 2026-11-22 ★4 | package:linter | own the astro/ rules and the
astro/client-side-ts processor in src/plugins/astro/, drop
eslint-plugin-astro, keep astro-eslint-parser, and lint TypeScript in the
client scripts of .astro files | plan docs/plans/2026-11-22-own-astro-rules

# Own the Astro rules and processor

Source: `docs/plans/2026-11-22-own-astro-rules/index.json`, decisions D1 to
D15. This is plan 5 of 6 of backlog item B08. D15 was decided during the run.

## Astro plan

- **D1** ★3 | rulings from plans 1 to 4 | keep the `astro/` namespace and
  the processor name `astro/client-side-ts`; credit the MIT code in
  `THIRD_PARTY_NOTICES.md` and a one-line source header in each ported file,
  test files included; the code goes in `src/plugins/astro/`, in strict
  TypeScript; the dependency criterion; no deprecated rules; each edit unit
  runs `code:format --fix` before it returns; a ported test may change its
  setup only, never its expected results | alt: a new namespace; a separate
  package — rejected
- **D2** ★3 | rules to port | 18 native rules: all except the deprecated
  `no-omitted-end-tags` and `valid-compile`; not the 36 `jsx-a11y/*`
  wrappers, which need `eslint-plugin-jsx-a11y`; the 9 rules of the preset
  are among the 18 | alt: all 56; the 20 native rules — rejected
- **D3** ★4 | packages to keep and to port | port `eslint-plugin-astro`
  3.2.1 (peers `eslint >=10`, `typescript-eslint`,
  `@typescript-eslint/parser`, `eslint-plugin-jsx-a11y`); keep
  `astro-eslint-parser` 3.2.0; add `postcss`, `postcss-selector-parser`,
  `synckit`, `@jridgewell/sourcemap-codec`, `@typescript-eslint/types`,
  `@eslint-community/eslint-utils` and `espree` as direct, exact-pinned,
  bundled dependencies; `@typescript-eslint/parser` stays for plan 6 | alt:
  port the parser or the small packages — rejected
- **D4** ★2 | upstream source files to port | `processor/`, `shared/`, all of
  `utils/` (with the PostCSS worker `postcss-worker.mts` that `synckit` loads
  from `dist/`), `environments/index.ts`, `types.ts`, `meta.ts`; not `a11y/`,
  `configs/`, `esm-config-builder.ts`, `index.mts`, `plugin.ts` (our plugin
  index replaces them) | alt: port the configs and the a11y wrappers —
  rejected
- **D5** ★2 | upstream tests to port | the rule fixtures without `jsx-a11y/`
  and the deprecated rules, the fixture loader without its write paths, the
  source-code fixer, the string-literal-parser test, the rule tests, and 10
  integration tests that use our astro preset; not the network-install test,
  the config, meta and typing tests | alt: golden only; every test — rejected
- **D6** ★4 | fix TypeScript in client scripts | yes (the user's ruling):
  upstream picked the processor by whether `@typescript-eslint/parser`
  resolves from the consumer cwd, so a consumer repo got `Parsing error:
  Unexpected token as`; the preset sets `astro/client-side-ts`, and
  `resolve-parser` loads `@typescript-eslint/parser` and `espree` from this
  package; a regression test runs from a temp directory outside the repo, and
  `valid.astro` has a TypeScript client script | alt: a separate plan later —
  rejected
- **D7** ★3 | rule configuration and parity proof | in the `astro` preset;
  the plugin exports `meta`, `rules`, `processors` (`.astro`, `astro`,
  `client-side-ts`) and `environments`, no configs; the preset reproduces
  `flat/recommended` without the `jsx-a11y` and `prettier` entries; golden
  changes only for the astro fixtures by the D6 fix, plus the new snapshot
  `config/file.astro__1.ts.json` | alt: configs in the plugin; accept any
  golden change — rejected
- **D8** ★1 | review unit and execution mode | one review unit after U4;
  teams, solo if a team cannot start | alt: wave review only; solo — rejected
- **D9** ★3 | release level | MINOR: the D6 fix changes behavior, and the
  deprecated rules and the `jsx-a11y/*` wrappers are removed; no consumer
  config names them (scan of `~/Projects`, 2026-11-22) | alt: PATCH; MAJOR —
  rejected
- **D10** ★1 | `--version` list | narrow the `@typescript-eslint/` pattern so
  that `@typescript-eslint/types` is not listed and
  `@typescript-eslint/parser` is; `eslint-plugin-astro` leaves the list | alt:
  list the new packages — rejected
- **D11** ★2 | preprocessors, style-lang cases, type shims, `--version`,
  versions, golden path, client-typescript test | `less`, `sass`, `stylus`
  and `postcss-load-config` stay consumer-local; the preprocessor test cases
  are not ported; `shims.d.ts` declares the modules the transforms use; pin
  the versions from `pnpm-lock.yaml`; the golden path is `file.astro/1.ts`;
  the client-typescript test imports `@typescript-eslint/parser` directly |
  alt: resolve parsers from the consumer cwd; preprocessors as
  devDependencies; `@types` packages; pin stale `node_modules` versions —
  rejected
- **D12** ★3 | virtual-file configs | the presets `astro-client-js` and
  `astro-client-ts` in `src/config/presets/astro-client.ts`, registered
  right after `astro`; consumers can target them in `overrides`; the
  integration tests use the astro preset plus the two client presets; the
  bug is reproduced with the worktree build | alt: optional virtual-file
  configs; an array preset; `createConfig()` in the tests — rejected
- **D13** ★2 | style-lang06, parser resolution, client-preset rules, U4
  order, the 95octane ignore | skip all six preprocessor cases; the
  `@babel/eslint-parser` fallback stays consumer-local; drop the
  `_ESLINT_PLUGIN_ASTRO_MODULES` test hook; import the bundled `espree`; the
  client presets carry `rules: {}`; the ignore in 95octane is a parked
  follow-up | alt: port style-lang06; keep the test hook; edit another repo
  after landing — rejected
- **D14** ★2 | unknown-rule disable comments and strict-TS errors in ported
  code | drop or rewrite the comment; fix TS errors only with changes that
  have no runtime effect; ruled for all B08 plans | alt: define the unknown
  rules; add runtime guards — rejected
- **D15** ★1 | types for `types.ts` | port the generated, type-only
  `types-for-node.ts` as `src/plugins/astro/types-for-node.ts`, so the rules
  keep the upstream types with no runtime effect | alt: inline the three
  types with a generic listener map; paste the file into `types.ts` —
  rejected
