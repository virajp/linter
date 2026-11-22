# U1 — Tailwind syntax, types and shared helpers

- **Read first:** the upstream files `src/types.ts`, `src/utils/*.ts` and
  `src/parser/tailwind-v4-syntax.ts` at tag `v0.3.1`, and the upstream tests
  `src/__tests__/parser/tailwind-v4-syntax.test.ts`,
  `src/__tests__/utils/ast.test.ts` and `src/__tests__/malformed-css.test.ts`.
  Read each with
  `gh api "repos/poupe-ui/eslint-plugin-tailwindcss/contents/<path>?ref=v0.3.1"
  --jq .content | base64 -d`.
- **Lazy-load:** `node_modules/tailwind-csstree/dist/tailwind4.js` (a
  reference for the Tailwind 4 syntax only),
  `node_modules/@eslint/css/dist/` (the `CSSLanguage` options and the
  `customSyntax` shape), `src/config/presets/css.ts`.

## Ruling

> D25 — (a) A ported file may drop an eslint-disable or eslint-enable comment
> that names a rule this repo does not define, or rewrite it to the rule
> of this repo that it means; ESLint 10 reports an unknown rule in such a
> comment as an error, so code:lint would fail. (b) Where the repo's
> strict TypeScript (noUncheckedIndexedAccess, verbatimModuleSyntax, .js
> import extensions) rejects ported code, a unit fixes it only with
> changes that have no runtime effect: non-null assertions, casts, type
> annotations, import type, and .js or /index.js on relative imports. No
> runtime guard is added. List each kind of change as DECIDED. (Ruled for
> all B08 plans on 2026-11-22, from the rulings review of plan 6.)

> D3 — Write our own Tailwind 4 syntax for CSSTree in the repo. Zero new
> packages.

> D5 — One notices file: THIRD_PARTY_NOTICES.md with the license text and
> copyright of each source, added to the files of package.json so it ships.
> Each ported file gets a one-line header that names its source. Later plans
> add their entries to the same file.

> D7 — Inside this package: src/plugins/tailwindcss/ (index.ts, syntax.ts,
> types.ts, utils/, rules/), compiled into dist/ with the rest.

> D8 — Our rules declare meta.languages ["css/css"].

> D12 — Imports from @eslint/css-tree and @eslint/core are type-only
> (import type). U4 adds both as devDependencies.

> D18 — An acknowledgement section with the Apache-2.0 license text of
> tailwind-csstree (the version read, 0.3.3), its repository, and its author
> as its package.json writes it, worded as a reference, not as copied code.
> Its LICENSE has no copyright line, so the section adds none.

> D14 — Port from the TypeScript source at tag v0.3.1, read with gh api. Not
> from the bundled dist in node_modules.

## Edits

1. **`src/plugins/tailwindcss/syntax.ts`** — export `tailwindSyntax`, our
   own CSSTree syntax extension for Tailwind CSS 4, the value that the css
   preset passes as `languageOptions.customSyntax`. It must cover everything
   that the upstream `tailwindV4Syntax` covers (the `tailwind4` syntax of
   `tailwind-csstree` 0.3.3 plus the `@tailwind` at-rule prelude). The full
   list of at-rules, functions and value forms is what
   `node_modules/tailwind-csstree/dist/tailwind4.js` and the upstream
   `src/parser/tailwind-v4-syntax.ts` define, and what the upstream parser
   test exercises. Read them to learn the list and the shape, then write our
   own code. Do not copy it.
2. **`src/plugins/tailwindcss/types.ts`** — port upstream `src/types.ts`. Keep
   only the types that the utils and the 19 rules use. Drop the plugin and
   config types that exist only for upstream `configs/`.
3. **`src/plugins/tailwindcss/utils/`** — port upstream `src/utils/*.ts`, one
   file each (`ast.ts`, `at-rules.ts`, `browser-compat.ts`,
   `css-properties.ts`, `css.ts`, `tailwind.ts`, `theme.ts`, `types.ts`). Keep
   the behavior the same. Convert to this repo's conventions: `.js` import
   extensions, `import type` for type-only imports, strict TS with
   `noUncheckedIndexedAccess`.
4. **Header of each ported file** — the first line is
   `// Ported from @poupe/eslint-plugin-tailwindcss v0.3.1 (MIT), src/<path>.`
   with the upstream path. A test file ported from upstream `src/__tests__/`
   gets the same header with its upstream test path. `syntax.ts` gets no such
   header, because it is our own code.
5. **`THIRD_PARTY_NOTICES.md`** (new, repo root) — a short intro sentence,
   then one section per source with the package name, version, repository
   URL, copyright line and the full license text. Put each license
   text in a fenced `text` code block, so dprint and the Markdown lint keep
   it verbatim. Add the section for
   `@poupe/eslint-plugin-tailwindcss` (MIT; read the copyright line from the
   upstream `LICENSE` at `v0.3.1`). Later plans append their sections.
   Also add an acknowledgement section for `tailwind-csstree` 0.3.3
   (Apache-2.0). Its `LICENSE` has no copyright line: name the repository
   `github.com/humanwhocodes/tailwind-csstree` and the author exactly as its
   `package.json` writes it ("Nicholas C. Zaks"), and add no copyright line
   of our own. Give the full license text, worded as a reference that
   `syntax.ts` was
   written from, not as copied code.
6. **`tests/unit/plugins/tailwindcss/syntax.test.ts`** — port the cases of
   the upstream `src/__tests__/parser/tailwind-v4-syntax.test.ts` that need
   only the syntax, not a rule and not the plugin index. Keep each ported
   case's config and assertion exactly as upstream has them, with our
   `tailwindSyntax` in place of the upstream syntax, and with
   `language: "css/css"` and `plugins: { css }` in place of upstream's
   `tailwindcss/css` language (D8); assert what upstream
   asserts and nothing more. The cases that need a rule or the plugin index,
   and all of `malformed-css.test.ts`, are U4's. Import from
   `../../../../src/plugins/tailwindcss/...js`, as the other unit tests
   import from `src/`.
7. **`tests/unit/plugins/tailwindcss/utils.test.ts`** — port the upstream
   `utils/ast.test.ts`.

## Verification

- `mise x -- mise run code:check` passes.
- `pnpm run build` passes, then
  `pnpx vitest run tests/unit/plugins/tailwindcss` passes.
- `grep -rn "tailwind-csstree" src/` returns nothing.
- Every import or re-export from `@eslint/css-tree` and `@eslint/core` in
  `src/plugins/` is type-only: `import type`, `export type`, or
  `export { type ... }`.
- Each ported file starts with the source header line.

## Guardrails

- Do not create `src/plugins/tailwindcss/index.ts` or any file in
  `src/plugins/tailwindcss/rules/`. U2, U3 and U4 own them.
- Do not edit `package.json`, `pnpm-lock.yaml` or `src/config/presets/css.ts`.
  U4 owns them. The type packages resolve through the hoisted
  `node_modules` until U4 lists them.
- Do not run `pnpm add`, `pnpm install` or `pnpm update`.
- Never run a bare `dprint fmt`. It reformats the fixtures.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D23).
- Delete with `rm`, never `git rm`.

## Commit

`feat(config): add the tailwind syntax and shared helpers of our css plugin`
