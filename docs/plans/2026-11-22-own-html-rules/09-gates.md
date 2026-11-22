# U9 — Gates

- **Read first:** the return block of U6.

## Ruling

> D10 — (a) U6 removes ^@html-eslint/ from the --version list. (b) U6 adds
> html-standard 0.0.13 as a direct, exact-pinned, bundled dependency. (c)
> Version drift of the kept packages is accepted. (d) U2 owns
> src/plugins/html/rules/indent/ with index, indent and indent-level, each
> with its own upstream path in the header. (e) U9 makes no commit when no
> file changes.

> D7 — In the html preset. The plugin index (U6) exports meta, rules (merged
> from rules/group-a.ts to group-d.ts) and languages { html }; no configs.
> The preset reproduces html.configs.recommended exactly (its rule
> severities and options) and keeps its own three rule overrides
> (html/indent [error, 2], html/no-extra-spacing-tags
> {enforceBeforeSelfClose: true}, html/require-closing-tags {selfClosing:
> always}), files ["**/*.html"] and language html/html. After U6, the
> golden snapshots do not change at all; any golden change stops the run
> with a QUESTION.

## Edits

1. Run `mise x -- mise run test:golden` (no `--update`). It must pass: D7
   allows no golden change. If it fails, return a QUESTION with the diff
   summary.
2. Run the full wave gate: `mise x -- mise run code:lint` and
   `mise x -- mise run code:check`.

## Verification

- `mise x -- mise run p:test` passes.

## Guardrails

- Change nothing. This unit only verifies, and it makes no commit when no
  file changes (D10 e).
- Do not bump a version.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`test(tests): confirm the golden snapshots with our html plugin`
