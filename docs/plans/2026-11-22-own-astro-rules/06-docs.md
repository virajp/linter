# U6 — Docs

- **Read first:** `CLAUDE.md`, `readme.md`, and every `DOCS FALSIFIED:` line
  that U1 to U4 returned.
- **Lazy-load:** the vwf `docs-sync` skill file, `docs/memory/decisions/`.

## Ruling

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

## Edits

1. Run `vwf:docs-sync` over the branch delta of this run, and apply its
   findings plus every `DOCS FALSIFIED:` line. The language tables of
   `CLAUDE.md` and `readme.md` name no plugin: leave them unchanged.
2. **`CLAUDE.md`** — the native-addon paragraph still holds
   (`astro-eslint-parser` stays). Add one sentence that TypeScript in a
   client `<script>` of an `.astro` file is linted (D6).
3. **`CLAUDE.md`, `readme.md`** — add the presets `astro-client-js` and
   `astro-client-ts` to the preset lists for `overrides` (D12 b).
4. **`docs/memory/decisions/2026-11-22-own-astro-rules.md`** (new) — a
   decisions doc per the vwf memory rule, with D1 to D13 of this plan in one
   line each.

## Verification

- `grep -rn "eslint-plugin-astro" CLAUDE.md readme.md` returns nothing,
  except in a sentence that says that it is gone.
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` pass.

## Guardrails

- Edit only docs.
- Write in ASD-STE100 Simplified Technical English, as the repo's other docs.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`docs: describe our own astro rules and the client-script fix`
