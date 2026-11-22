# U8 — Docs

- **Read first:** `CLAUDE.md`, `readme.md`, and every `DOCS FALSIFIED:` line
  that U1 to U6 returned.
- **Lazy-load:** the vwf `docs-sync` skill file, `docs/memory/decisions/`.

## Ruling

> D1 — Keep the html/ namespace (the user's virajp.dev config overrides
> html/attrs-newline and html/use-baseline). Credit the MIT code in
> THIRD_PARTY_NOTICES.md plus a one-line source header in each ported
> file, test files included. Put the code in src/plugins/html/.
> Dependencies follow the user's criterion: a direct dependency is not a
> concern; port what brings peer ranges or conflicting transitive trees.
> No Vue support. Each edit unit runs mise x -- mise run code:format --fix
> before it returns. Each test file connects RuleTester to vitest itself
> (RuleTester.describe, it, itOnly from vitest) and imports from src/.

> D4 — 65 rules of @html-eslint/eslint-plugin 0.68.0: all except the deprecated
> no-extra-spacing-attrs. The 18 rules that the preset enables are among
> them.

## Edits

1. Run `vwf:docs-sync` over the branch delta of this run, and apply its
   findings plus every `DOCS FALSIFIED:` line. The language tables of
   `CLAUDE.md` and `readme.md` name no plugin: leave them unchanged.
2. **`docs/memory/decisions/2026-11-22-own-html-rules.md`** (new) — a
   decisions doc per the vwf memory rule, with D1 to D13 of this plan in one
   line each.

## Verification

- `grep -rn "@html-eslint/eslint-plugin" CLAUDE.md readme.md` returns
  nothing, except in a sentence that says that it is gone.
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` pass.

## Guardrails

- Edit only docs.
- Write in ASD-STE100 Simplified Technical English, as the repo's other docs.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`docs: describe our own html rules`
