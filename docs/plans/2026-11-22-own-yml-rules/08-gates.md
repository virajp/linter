# U8 — Gates

- **Read first:** the return block of U5 (the golden diff summary).
- **Lazy-load:** `tests/golden/config.test.ts`.

## Ruling

> D8 — The config snapshots of file.yaml and file.yml can change only in
> their parser field and by the removal of the
> yml/vue-custom-block/no-parsing-error entry. Any other golden change stops
> the run with a QUESTION.

## Edits

1. Run `mise x -- mise run test:golden --update`.
2. Examine `git diff --stat tests/golden/__snapshots__/` and the diff. Pass
   condition: only `config/file.yaml.json` and `config/file.yml.json`
   change, and only in the ways D8 allows. If any other file or entry
   changes, return a QUESTION with the diff summary.
3. Run the full wave gate: `mise x -- mise run code:lint` and
   `mise x -- mise run code:check`.

## Verification

- `mise x -- mise run test:golden` passes with no `--update`.
- `mise x -- mise run p:test` passes.

## Guardrails

- Change only `tests/golden/__snapshots__/`.
- Do not bump a version.
- Before you return, run `mise x -- mise run code:format --fix`, so that
  the unit gate (check only) passes (D17).
- Delete with `rm`, never `git rm`.

## Commit

`test(tests): write the golden snapshots again for our yml plugin`
