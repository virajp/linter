# U4 — Create the plugin index, switch the css preset to it, then upgrade @eslint/css to 2.0.1

- **Read first:** every owned file, top to bottom.
  `src/plugins/tailwindcss/rules/group-a.ts` and `group-b.ts`,
  `src/plugins/tailwindcss/syntax.ts`. The poupe recommended config as it
  resolves now:
  `node --input-type=module -e 'const p=(await
  import("@poupe/eslint-plugin-tailwindcss")).default;
  console.log(JSON.stringify([p.configs.recommended].flat().map(c=>({name:c.name,files:c.files,language:c.language,languageOptions:Object.keys(c.languageOptions??{}),rules:c.rules})),null,2))'`.
  Do this step **before** step 3 removes the package.
- **Lazy-load:** `tests/golden/config.test.ts`, `tests/golden/lint.test.ts`,
  `tests/unit/presets.test.ts`, `src/config/index.ts`.

## Ruling

> D2 — Keep current names: our plugins register under the same keys
> (tailwindcss/, ...). No consumer override breaks.

> D5 — THIRD_PARTY_NOTICES.md is added to the files of package.json so it
> ships.

> D8 — No own language. The css preset uses the css/css language of
> @eslint/css with our Tailwind syntax as customSyntax and tolerant: true.
> @eslint/css 2.0.0 adds meta.languages to its rules, so css/* rules run only
> on css/css.

> D9 — U4 first switches the preset to our plugin on @eslint/css 1.4.0 and
> runs the golden tests: lint/problems.json and lint/fixes.json must not
> change, and config/file.css.json may change only in its language
> (tailwindcss/css to css/css) and by the removal of
> tailwindcss/require-reference-in-vue (D22). Then U4 upgrades to 2.0.1, so the
> later
> golden diff shows only the upgrade.

> D12 — Add both @eslint/css-tree and @eslint/core as exact-pinned
> devDependencies, at the versions that @eslint/css 2.0.1 resolves.

> D17 — U4 may edit files under src/plugins/tailwindcss/ only to fix compile
> errors that the upgrade causes, with no change in behavior, and reports
> each as DECIDED. The review unit checks them.

> D21 — U4 may change the expected results in tests of rules that wrap or
> reuse an @eslint/css rule (D16 and the wrappers in utils/css.ts), only
> where the upgrade changes them, and reports each as DECIDED. The review
> unit checks them. A failure in any other rule test stops the run with a
> QUESTION.

> D13 — The plugin index exports meta and rules only (no configs, no
> languages); it merges the rule registries rules/group-a.ts (U2) and
> rules/group-b.ts (U3). The preset reproduces the rule severities and the
> rule options of the poupe recommended config exactly, except that it
> does not set tailwindcss/require-reference-in-vue (D22). It keeps files
> ["**/*.css"]: extends intersects the poupe glob **/*.?(post)css with the
> preset glob, so the current preset lints .css files only. The language
> follows D8.

## Edits

Do the steps in this order. Steps 1 to 4 are on `@eslint/css` 1.4.0.

1. **`src/plugins/tailwindcss/index.ts`** (new) — export default a plugin
   object `{ meta: { name: "tailwindcss" }, rules: { ...groupARules,
   ...groupBRules } }`, and export `tailwindSyntax` again from `syntax.ts`.
   Type it with `ESLint.Plugin` from `eslint`. No `configs`, no `languages`.
2. **`src/config/presets/css.ts`** — remove the poupe import. Keep
   `name: "css"`, `files: ["**/*.css"]` and the extend of
   `css.configs.recommended`. Add `plugins: { tailwindcss: <our plugin> }`,
   `language: "css/css"`, `languageOptions: { tolerant: true, customSyntax:
   tailwindSyntax }`, and the `tailwindcss/*` rule severities and rule options
   exactly as the
   poupe recommended config sets them (3 warn, 11 error; see the facts), without
   `tailwindcss/require-reference-in-vue` (D22).
   Keep `files: ["**/*.css"]`: the poupe glob `**/*.?(post)css` is
   intersected with the preset glob today, so only `.css` files are linted.
   Keep `"css/no-invalid-at-rules": "off"`. Do not copy anything else from the
   poupe config unless the golden check of step 4 needs it.
3. **Remove the poupe plugin** — run
   `mise x -- pnpm remove @poupe/eslint-plugin-tailwindcss`. Then remove it
   from `bundledDependencies` in `package.json`, and from `allowBuilds` in
   `pnpm-workspace.yaml`. In `tests/unit/peers.test.ts`, remove the `ALLOWED`
   entry `"@poupe/eslint-plugin-tailwindcss>eslint@^9.30.0"`. In
   `src/cli/commands/version.ts`, remove the `^@poupe/eslint-plugin-` regex
   from the plugin name list.
4. **Parity check on 1.4.0** — run `pnpm run build`, then
   `pnpx vitest run tests/golden` (no `--update`). Pass condition:
   `lint/problems.json` and `lint/fixes.json` match, and the only failure in
   `config/` is `file.css.json`, with a difference only in `language`
   (`tailwindcss/css` to `css/css`) and the removal of the
   `tailwindcss/require-reference-in-vue` entry (D22). Record the vitest summary
   for the return
   block. If
   any other snapshot differs, stop and return a QUESTION with the diff
   summary. Do not continue to step 5.
5. **Upgrade `@eslint/css`** — run `mise x -- pnpm add --save-exact
   @eslint/css@2.0.1`. Then run `mise x -- pnpm add --save-dev --save-exact
   @eslint/css-tree@<version> @eslint/core@<version>`, where each version is
   the one that `@eslint/css` itself resolves after the upgrade: read
   `node_modules/@eslint/css/node_modules/@eslint/<pkg>/package.json` if it
   exists (a nested copy), else `node_modules/@eslint/<pkg>/package.json`
   (the hoisted copy). `@eslint/css` does not export its `package.json`, so
   `require.resolve` of it fails. Make sure `@eslint/css` stays
   in `bundledDependencies`. Add `"THIRD_PARTY_NOTICES.md"` to `files` in
   `package.json`.
6. **Remove the `@eslint/css` hold** — in `.config/mise/tasks/p/upgrade.py`,
   remove `"!@eslint/css"` from the `pnpm update` line and remove its comment
   (lines 50-53 now). In `.github/workflows/deps-update.yml`, remove
   `"!@eslint/css"` from the `pnpm update` line and remove its comment (lines
   47-50 now). The two `pnpm update` lines must stay the same apart from the
   `--recursive` flag that only `upgrade.py` has today.

7. **`tests/unit/plugins/tailwindcss/malformed-css.test.ts`** (new) — port
   the upstream `src/__tests__/malformed-css.test.ts`, and the cases of the
   upstream `src/__tests__/parser/tailwind-v4-syntax.test.ts` that need a
   rule or the plugin index (U1 ported the rest into `syntax.test.ts`; add
   these cases to the new file, not to U1's file). Keep each case's config and
   assertion exactly as upstream has them, with our plugin and
   `tailwindSyntax` in place of upstream's. Where upstream uses
   `language: "tailwindcss/css"` with `plugins: { tailwindcss: plugin }`, use
   `language: "css/css"` with `plugins: { css, tailwindcss: <our plugin> }`
   (D8). If the file uses `RuleTester`, connect it to vitest in the file, as
   U2 and U3 do. The first line is the source
   header with the upstream test path (D5). Do this step after step 1, on
   `@eslint/css` 1.4.0.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit tests/integration`
  passes. The peers test passes with an empty `ALLOWED` list. After step 5,
  the one accepted failure is the integration test that lints
  `tests/fixtures/css/valid.css` with no errors, if `@eslint/css` 2.x reports
  a new problem there; report it, and U7 fixes the fixture (D19).
- After step 5, `pnpx vitest run tests/golden` fails only in snapshots that
  involve CSS: `config/file.css.json`, and the CSS entries of
  `lint/problems.json` and `lint/fixes.json`. Report the failing snapshot
  names. U7 writes the snapshots again.
- `grep -rn "poupe" package.json pnpm-workspace.yaml tests/unit .config/mise
  .github src/config src/cli`
  returns nothing, and `grep -rn "from \"@poupe" src/` returns nothing. The
  source headers in `src/plugins/tailwindcss/` keep the name (D5).
- `grep -n "@eslint/css" .config/mise/tasks/p/upgrade.py
  .github/workflows/deps-update.yml`
  returns no hold.
- `node dist/index.js --version` lists no `@poupe/` package.

## Guardrails

- Never edit `pnpm-lock.yaml` by hand. Only `pnpm add` and `pnpm remove`
  change it.
- If `pnpm add` or `pnpm remove` removes other packages from
  `node_modules`, run `mise x -- pnpm install --frozen-lockfile`.
- Do not run `vitest --update`. U7 owns `tests/golden/__snapshots__/`.
- Do not edit `CLAUDE.md` or `readme.md`. Report their stale passages as
  `DOCS FALSIFIED:`.
- Do not edit any rule file, registry, helper or `syntax.ts`, except to fix a
  compile error that the upgrade causes, with no change in behavior (D17).
  If a golden difference comes from a rule, return a QUESTION.
- Do not touch the `typescript` hold in `upgrade.py` or `deps-update.yml`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D23).
- Delete with `rm`, never `git rm`.

## Commit

`feat(deps): use our own tailwind rules and upgrade @eslint/css to 2.0.1`
