# U7 — Gates

- **Read first:** the return block of U4 (the golden diff summary).

## Ruling

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

## Edits

1. Run `mise x -- mise run test:golden --update`. The task passes a part's
   flag with no `--`.
2. Examine `git diff --stat tests/golden/__snapshots__/` and the diff. Pass
   condition: the changes are only the ones D7 allows (the new snapshot of the
   virtual client script, and changes to `tests/fixtures/astro/` entries and
   `config/file.astro.json` that the D6 fix causes). If any other file or
   entry changes, return a QUESTION with the diff summary.
3. Run the full wave gate: `mise x -- mise run code:lint` and
   `mise x -- mise run code:check`.

## Verification

- `mise x -- mise run test:golden` passes with no `--update`.
- `mise x -- mise run p:test` passes.

## Guardrails

- Change only `tests/golden/__snapshots__/`.
- Do not bump a version.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`test(tests): write the golden snapshots again for our astro plugin`
