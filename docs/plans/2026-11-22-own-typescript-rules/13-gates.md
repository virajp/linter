# U13 — Gates

- **Read first:** the return block of U10.

## Ruling

> D8 — In the typescript preset. The plugin index (U10) exports meta and rules
> (merged from rules/group-a.ts to group-h.ts); no configs. The preset
> reproduces tseslint.configs.recommended exactly: its base entry (the
> @typescript-eslint/parser and sourceType module), its eslint-recommended
> entry (the core rules it turns off for TypeScript files), and its
> recommended entry: the 20 @typescript-eslint/ rules with their
> severities plus the core rules no-array-constructor,
> no-unused-expressions and no-unused-vars turned off; plus the preset's
> own globals, js.configs.recommended, and its own rule overrides. The
> plugin is registered as @typescript-eslint; the old alias key tseslint
> is dropped. After U10, the golden snapshots do not change at all; any
> golden change stops the run with a QUESTION.

## Edits

1. Run `mise x -- mise run test:golden` (no `--update`). It must pass: D8
   allows no golden change. If it fails, return a QUESTION with the diff
   summary.
2. Run the full wave gate: `mise x -- mise run code:lint` and
   `mise x -- mise run code:check`.

## Verification

- `mise x -- mise run p:test` passes.

## Guardrails

- Change nothing. This unit only verifies, and it makes no commit when no
  file changes.
- Do not bump a version.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`test(tests): confirm the golden snapshots with our typescript plugin`
