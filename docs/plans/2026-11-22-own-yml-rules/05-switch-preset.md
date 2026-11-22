# U5 — Create the yml plugin index, switch the yaml preset to it, and change the dependencies

- **Read first:** every owned file, top to bottom. The rule registries
  `src/plugins/yml/rules/group-a.ts`, `group-b.ts`, `group-c.ts`,
  `src/plugins/yml/language/index.ts`, `src/plugins/yml/meta.ts`. The
  recommended config of the plugin as it resolves now, **before** step 3
  removes the package:
  `node --input-type=module -e 'const p=(await
  import("eslint-plugin-yml")).default;
  console.log(JSON.stringify([p.configs["flat/recommended"]].flat().map(c=>({name:c.name,files:c.files,language:c.language,languageOptions:Object.keys(c.languageOptions??{}),rules:c.rules})),null,2))'`.
- **Lazy-load:** `src/plugins/tailwindcss/index.ts` (plan 1, the index shape),
  `tests/golden/config.test.ts`, `tests/unit/plugins/yml/language/`.

## Ruling

> D2 — Keep yaml-eslint-parser (already a direct dependency). Add
> @eslint/plugin-kit, @ota-meshi/ast-token-store, natural-compare,
> diff-sequences and escape-string-regexp as direct, exact-pinned, bundled
> dependencies.

> D4 — The plugin registers the language as languages.yaml, so the language
> name stays yml/yaml.

> D7 — The plugin index exports meta, rules (merged from rules/group-a.ts,
> group-b.ts, group-c.ts) and languages { yaml }. No configs. The preset
> reproduces the flat/recommended config of eslint-plugin-yml exactly
> (language, the yml/ rule severities and options, and the core rules it
> turns off), except that it does not set
> yml/vue-custom-block/no-parsing-error, and it keeps files
> ["**/*.yaml", "**/*.yml"].

> D8 — After U5, lint/problems.json and lint/fixes.json of the golden tests
> do not change. The config snapshots of file.yaml and file.yml can change
> only in their parser field and by the removal of the
> yml/vue-custom-block/no-parsing-error entry. Any other golden change stops
> the run with a QUESTION.

> D12 — Do not port vue-custom-block/no-parsing-error.

> D14 — (a) U1 does not port directive-comments.ts; U5 ports it whole into
> with-rules.test.ts. (b) makeSuiteTests is dropped. (c) U1 ports
> tests/src/utils/casing.ts. (d) The tests of utils/rules.ts, meta.ts,
> eslint-plugin.ts and configs/ are not ported. (e) U1 copies only
> fixtures/rules/ (D15 b).

> D13 — (a) U1 does not port upstream src/utils/rules.ts. (b) The ported
> loadTestCases takes the plugin object as a parameter. (c) The test
> yaml-source-code-with-stylistic-rules is not ported. (d) natural-compare
> types come from a local declare module; JSON-schema types come from
> @eslint/core. (e) U5 keeps @eslint/plugin-kit out of --version. (f) The
> preset keeps files ["**/*.yaml", "**/*.yml"]. (g) The loader never writes
> a fixture.

## Edits

Do the steps in this order.

1. **`src/plugins/yml/index.ts`** (new) — export default a plugin object
   `{ meta, rules: { ...groupARules, ...groupBRules, ...groupCRules },
   languages: { yaml: <the YAMLLanguage instance> } }`, typed with
   `ESLint.Plugin` from `eslint`. No `configs`.
2. **`src/config/presets/yaml.ts`** — remove the `eslint-plugin-yml` import.
   Keep `name: "yaml"` and `files: ["**/*.yaml", "**/*.yml"]`. Set
   `plugins: { yml: <our plugin> }`, `language: "yml/yaml"`, and the rules of
   the dumped recommended config, without
   `yml/vue-custom-block/no-parsing-error`. Keep or drop
   `languageOptions.parser` by what the language needs (keep `files` as it
   is; D13 f): our language parses
   with `yaml-eslint-parser` itself. Report the choice as `DECIDED:`.
3. **Change the dependencies.** Run, through `mise x --`:
   - `pnpm remove eslint-plugin-yml`;
   - `pnpm add --save-exact @eslint/plugin-kit@<v>
     @ota-meshi/ast-token-store@<v> natural-compare@<v> diff-sequences@<v>
     escape-string-regexp@<v>`,
     each `<v>` the version installed in `node_modules` before this step
     (read each `node_modules/<pkg>/package.json` first).

   Then put all 5 new packages in `bundledDependencies`, and remove
   `eslint-plugin-yml` from it. `yaml-eslint-parser` stays in both lists.
4. **`src/cli/commands/version.ts`** — keep `@eslint/plugin-kit` out of the
   `--version` plugin list, which lists plugins only (D13 e). Change only the
   name filter.
5. **Add the deferred language test cases** — the cases that U1 left out
   because they needed a rule, and all of upstream
   `tests/src/language/directive-comments.ts` (D14 a). Put them in a new file,
   `tests/unit/plugins/yml/language/with-rules.test.ts`, with the source
   header of each upstream test they come from, so that U1's files stay
   unchanged.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build`, then `pnpx vitest run tests/unit tests/integration`
  passes.
- `pnpx vitest run tests/golden` fails only in `config/file.yaml.json` and
  `config/file.yml.json`, and only in the ways D8 allows. Report the diff
  summary. U8 writes the snapshots again.
- `grep -rn "eslint-plugin-yml" src/config package.json` returns nothing.
- `node dist/index.js --version` lists no `eslint-plugin-yml`.

## Guardrails

- Never edit `pnpm-lock.yaml` by hand. Only `pnpm add` and `pnpm remove`
  change it. If they remove other packages from `node_modules`, run
  `mise x -- pnpm install --frozen-lockfile`.
- Do not run `vitest --update`. U8 owns `tests/golden/__snapshots__/`.
- Do not edit a rule file, a registry, the language, the utils or a fixture.
  If a golden difference comes from a rule, return a QUESTION.
- Do not edit `CLAUDE.md` or `readme.md`. Report stale passages as
  `DOCS FALSIFIED:`.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D17).
- Delete with `rm`, never `git rm`.

## Commit

`feat(deps): use our own yml rules and language`
