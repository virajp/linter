# U6 — Docs

- **Wave:** 4
- **Depends on:** all
- **Owns:** `readme.md`, `CLAUDE.md`,
  `docs/memory/decisions/2026-10-16-rename-to-virajp-dev-linter.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `readme.md` and `CLAUDE.md`, top to bottom.
- **Lazy-load:** the docs-sync skill
  (`/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md`),
  the memory doctrine for the decisions doc
  (`/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.dev-marketplace/plugins/vwf/assets/memory.md`)

## Ruling

From index.md, assumed decisions:

> 1 — Sequence: Do the rename before `/vwf:setup`, in the current
> single-package shape (reversal R1).

> 2 — First new version: 2.0.0 (reversal R2). No unit bumps the version.
> `p:release --major` bumps it after the landing.

> 12 — Consumer migration: `readme.md` gets a section "Migrate from
> @askviraj/linter". No new code.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta. Apply its findings and
   every `DOCS FALSIFIED:` line that U1 to U4 returned.
2. **`readme.md`**
   - Replace `@askviraj/linter` with `@virajp.dev/linter` at `:1`, `:22`, `:25`,
     `:32`, `:35`, `:42`, `:45`, `:48`, `:51`, `:149`, `:157`, `:170`.
   - `:78`, `:151`, `:153`: describe the new `--init` behavior.
     `.vscode/settings.json` is updated only if it exists; if not, `--init`
     skips it. `--force` overwrites only `eslint.config.mjs` and
     `.config/linter.yaml`.
   - Add a section "Migrate from @askviraj/linter": change the command to
     `npx @virajp.dev/linter`; in `eslint.config.mjs` change the import to
     `export { default } from "@virajp.dev/linter/auto";`; remove
     `@askviraj/linter` from the project if it is installed. Do not tell users
     to run `--init --force`: it overwrites `.config/linter.yaml`.
3. **`CLAUDE.md`**
   - Replace the old name at `:8`, `:109`, `:161`, `:162`, `:187`, `:189`,
     `:294`. `:294` describes the npm Trusted Publisher: it is now for
     `@virajp.dev/linter`.
   - `:192-193`: `.vscode/settings.json` is edited only if it exists.
   - "Releasing": `release.yml`'s publish job skips the publish when the
     version is already on npm.
   - Add one short paragraph for `sunset/`: a tombstone package for
     `@askviraj/linter@2.0.0`, published once by hand; not a workspace member;
     not part of the release pipeline.
4. **`docs/memory/decisions/2026-10-16-rename-to-virajp-dev-linter.md`** — one
   decisions doc, in the shape `memory.md` gives, for the two reversals: R1
   (rename before `/vwf:setup`) and R2 (first version 2.0.0, not 1.0.0, because
   the tag `v1.0.0` exists). Also record decisions 5 to 8 (the tombstone) and
   13 (skip an existing version in CI), with their rejected alternatives.

Write every new or changed passage in ASD-STE100 Simplified Technical English.
Edit only the passages that the change falsified.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run code:lint`
- `command grep -n askviraj readme.md CLAUDE.md` returns only the passages that
  name the old package on purpose (the migration section, the `sunset/`
  paragraph).

## Guardrails

- Touch nothing outside the owned paths.
- Do not edit `docs/plans/**`.
- Never run a bare `dprint fmt`. Use `mise x -- mise run code:format --fix`.
- Delete with `rm`, never `git rm`.

## Commit

`docs: document the rename to @virajp.dev/linter`
