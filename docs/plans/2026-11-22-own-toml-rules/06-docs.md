# U6 — Docs

- **Read first:** `CLAUDE.md`, `readme.md`, and every `DOCS FALSIFIED:` line
  that U1 to U4 returned.
- **Lazy-load:** the vwf `docs-sync` skill file, `docs/memory/decisions/`.

## Ruling

> D1 — Keep the toml/ namespace. Credit the MIT code in
> THIRD_PARTY_NOTICES.md plus a one-line source header in each ported file,
> test files included. Put the code in src/plugins/toml/. No Vue support.
> Each edit unit runs code:format --fix before it returns.

> D2 — 22 rules: all except vue-custom-block/no-parsing-error and the
> deprecated space-eq-sign.

## Edits

1. Run `vwf:docs-sync` over the branch delta of this run, and apply its
   findings plus every `DOCS FALSIFIED:` line.
2. **`CLAUDE.md`, `readme.md`** — every passage that names
   `eslint-plugin-toml` as a dependency, if docs-sync finds one. The language
   tables (`CLAUDE.md`, `readme.md`) name no plugin: leave them unchanged.
3. **`docs/memory/decisions/2026-11-22-own-toml-rules.md`** (new) — a
   decisions doc per the vwf memory rule, with D1 to D10 of this plan in one
   line each.

## Verification

- `grep -rn "eslint-plugin-toml" CLAUDE.md readme.md` returns nothing,
  except in a sentence that says that it is gone.
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` pass.

## Guardrails

- Edit only docs.
- Write in ASD-STE100 Simplified Technical English, as the repo's other docs.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`docs: describe our own toml rules`
