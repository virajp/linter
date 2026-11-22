# U7 — Docs

- **Read first:** `CLAUDE.md`, `readme.md`, and every `DOCS FALSIFIED:` line
  that U1 to U5 returned.
- **Lazy-load:** the vwf `docs-sync` skill file, `docs/memory/decisions/`.

## Ruling

> D2 — The user's criterion: a direct dependency is not a concern; the
> problem is transitive dependencies that conflict between direct
> dependencies. Port eslint-plugin-yml. Keep yaml-eslint-parser. Add
> @eslint/plugin-kit, @ota-meshi/ast-token-store, natural-compare,
> diff-sequences and escape-string-regexp as direct, exact-pinned, bundled
> dependencies.

> D12 — The Vue-only rule vue-custom-block/no-parsing-error is not ported.

## Edits

1. Run `vwf:docs-sync` over the branch delta of this run, and apply its
   findings plus every `DOCS FALSIFIED:` line.
2. **`CLAUDE.md`** — the passages that name `eslint-plugin-yml` as a
   dependency; the "Dependency policy" section, which gains the user's
   criterion of D2 in one short paragraph; the "Testing" section, which
   gains the vendored upstream fixtures under `tests/unit/plugins/<name>/
   fixtures/` and the wider pre-commit exclude.
3. **`readme.md`** — any passage that names `eslint-plugin-yml`.
4. **`docs/memory/decisions/2026-11-22-own-yml-rules.md`** (new) — a
   decisions doc per the vwf memory rule, with D1 to D18 of this plan in one
   line each. Mark D2 as the dependency criterion that plans 3 to 6 of B08
   inherit.

## Verification

- `grep -rn "eslint-plugin-yml" CLAUDE.md readme.md` returns nothing, except
  in a sentence that says that it is gone.
- `mise x -- mise run code:format` and `mise x -- mise run code:lint` pass.

## Guardrails

- Edit only docs.
- Write in ASD-STE100 Simplified Technical English, as the repo's other docs.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D17).
- Delete with `rm`, never `git rm`.

## Commit

`docs: describe our own yml rules and the dependency criterion`
