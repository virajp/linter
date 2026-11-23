# U7 — Gates

- **Read first:** the return block of U4 (the golden diff summary).

## Ruling

> D6 — config/file.toml.json changes only by the removal of the
> toml/vue-custom-block/no-parsing-error entry; any other golden change stops
> the run with a QUESTION.

## Edits

1. Run `mise x -- mise run test:golden --update`. The task passes a part's
   flag with no `--`.
2. Examine `git diff --stat tests/golden/__snapshots__/` and the diff. Pass
   condition: only `config/file.toml.json` changes, in the way D6 allows. If
   any other file or entry changes, return a QUESTION with the diff summary.
3. Run the full wave gate: `mise x -- mise run code:lint` and
   `mise x -- mise run code:check`.

## Verification

- `mise x -- mise run test:golden` passes with no `--update`.
- `mise x -- mise run p:test` passes.

## Guardrails

- Change only `tests/golden/__snapshots__/`.
- Do not bump a version.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D1).
- Delete with `rm`, never `git rm`.

## Commit

`test(tests): write the golden snapshots again for our toml plugin`
