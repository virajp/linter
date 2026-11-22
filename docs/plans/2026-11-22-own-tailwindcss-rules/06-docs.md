# U6 — Docs

- **Read first:** `CLAUDE.md`, `readme.md`, and every `DOCS FALSIFIED:` line
  that U1 to U4 returned.
- **Lazy-load:** the vwf `docs-sync` skill file, `docs/memory/decisions/`.

## Ruling

> D5 — THIRD_PARTY_NOTICES.md with the license text and copyright of each
> source ships in the package.

> D7 — Our plugin code lives inside this package: src/plugins/tailwindcss/.
> Later plans add src/plugins/<name>/.

> D12 — @eslint/css-tree and @eslint/core are exact-pinned devDependencies
> for type-only imports.

## Edits

1. Run `vwf:docs-sync` over the branch delta of this run, and apply its
   findings plus every `DOCS FALSIFIED:` line.
2. **`CLAUDE.md`** — these passages are known to be false after the run:
   - The "Dependency policy" hold of `@eslint/css` at 1.x (line 56 at plan
     time). Remove it. The `typescript` hold stays.
   - The language table and "Adding a language or plugin": say that the
     Tailwind rules are our own code in `src/plugins/tailwindcss/`, that new
     rules go to `src/plugins/<name>/` (not to a new third-party plugin), and
     that a ported file gets a source header and an entry in
     `THIRD_PARTY_NOTICES.md`.
   - Any passage that names `@poupe/eslint-plugin-tailwindcss` or the
     `tailwindcss/css` language.
3. **`readme.md`** — any passage that names the poupe plugin, the
   `tailwindcss/css` language, or the `@eslint/css` hold. The Tailwind rule
   names do not change, so an override example with a `tailwindcss/` rule
   stays.
4. **`docs/memory/decisions/2026-11-22-own-tailwindcss-rules.md`** (new) — a
   decisions doc per the vwf memory rule, with D1 to D21 of this plan in one
   line each. D1, D2, D5 and D7 apply to all of B08, so mark them as the
   rulings that the later B08 plans inherit.

## Verification

- `grep -rn "poupe\|tailwindcss/css" CLAUDE.md readme.md` returns nothing,
  except in the decisions doc.
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` pass.

## Guardrails

- Edit only docs. Do not edit source, tests, `package.json` or snapshots.
- Write in ASD-STE100 Simplified Technical English, as the repo's other
  docs.
- Delete with `rm`, never `git rm`.

## Commit

`docs: describe our own tailwind rules and the @eslint/css 2.x upgrade`
