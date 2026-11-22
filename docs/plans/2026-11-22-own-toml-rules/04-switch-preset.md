# U4 — Create the toml plugin index, switch the toml preset to it, and change the dependencies

- **Read first:** every owned file. `src/plugins/toml/rules/group-a.ts`,
  `group-b.ts`, `src/plugins/toml/language/index.ts`,
  `src/plugins/toml/meta.ts`, `src/plugins/yml/index.ts` (plan 2, the index
  shape). Upstream `tests/src/language/directive-comments.ts` and
  `tests/src/rules-without-vue-eslint-parser.ts` at `v1.5.0`, and the
  `DECIDED:` list of U1 (the language test cases it left out).
- **Lazy-load:** `tests/golden/config.test.ts`.

## Ruling

> D1 — Keep the toml/ namespace. Credit the MIT code in
> THIRD_PARTY_NOTICES.md plus a one-line source header in each ported file,
> test files included. Put the code in src/plugins/toml/. No Vue support.
> Each edit unit runs code:format --fix before it returns.

> D3 — Remove eslint-plugin-toml. Add toml-eslint-parser 1.0.3 as a direct,
> exact-pinned, bundled dependency.

> D5 — U4 ports tests/src/language/directive-comments.ts and the cases that
> U1 left out into with-rules.test.ts, and
> tests/src/rules-without-vue-eslint-parser.ts into rules-on-js.test.ts.

> D6 — The plugin index exports meta, rules (merged from rules/group-a.ts and
> group-b.ts) and languages { toml }; no configs. The preset reproduces the
> recommended config (language toml/toml, the core rules
> no-irregular-whitespace and spaced-comment off, and
> toml/no-unreadable-number-separator, toml/precision-of-fractional-seconds,
> toml/precision-of-integer as error), without
> toml/vue-custom-block/no-parsing-error, and keeps files ["**/*.toml"].
> After U4, lint/problems.json and lint/fixes.json do not change, and
> config/file.toml.json changes only by the removal of the
> toml/vue-custom-block/no-parsing-error entry; any other golden change stops
> the run with a QUESTION.

## Edits

1. **`src/plugins/toml/index.ts`** (new) — export default
   `{ meta, rules: { ...groupARules, ...groupBRules }, languages: { toml:
   <the TOMLLanguage instance> } }`, typed with `ESLint.Plugin`. No
   `configs`.
2. **`src/config/presets/toml.ts`** — remove the `eslint-plugin-toml`
   import. Write the config that D6 names, with `plugins: { toml: <our
   plugin> }` and `name: "toml"`.
3. **Change the dependencies**, through `mise x --`:
   `pnpm remove eslint-plugin-toml`, then
   `pnpm add --save-exact toml-eslint-parser@1.0.3`. Then add
   `toml-eslint-parser` to `bundledDependencies` and remove
   `eslint-plugin-toml` from it. If the commands remove other packages from
   `node_modules`, run `mise x -- pnpm install --frozen-lockfile`.
4. **`tests/unit/plugins/toml/language/with-rules.test.ts`** (new) — port
   upstream `directive-comments.ts` whole and the cases that U1 left out,
   with our plugin, and the source header of each upstream file.
5. **`tests/unit/plugins/toml/rules-on-js.test.ts`** (new) — port
   `rules-without-vue-eslint-parser.ts` with our plugin and its 22 rules,
   and the source header.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit tests/integration`
  passes.
- `pnpx vitest run tests/golden` fails only in `config/file.toml.json`, in
  the way D6 allows. Report the diff summary. U7 writes the snapshots again.
- `grep -rn "eslint-plugin-toml" src/config package.json` returns nothing.

## Guardrails

- Never edit `pnpm-lock.yaml` by hand.
- Do not run `vitest --update`.
- Do not edit a rule file, a registry, the language, the utils or a fixture.
  If a golden difference comes from a rule, return a QUESTION.
- Do not edit `CLAUDE.md` or `readme.md`. Report stale passages as
  `DOCS FALSIFIED:`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`feat(deps): use our own toml rules and language`
