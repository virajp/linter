# U7 — Gates

- **Read first:** the return block of U4 (the failing golden snapshots after
  the upgrade).
- **Lazy-load:** `tests/golden/config.test.ts`, `tests/golden/lint.test.ts`.

## Ruling

> D9 — The golden diff after the upgrade shows only the upgrade.

> D19 — U7 owns tests/fixtures/css/valid.css. It may change only the CSS
> that the new problem reports, keeps the CSS features the file has (modern
> syntax, so a parser regression still shows), and reports the change. It
> writes the golden snapshots after the fix.

> D20 — A changed tailwindcss/ problem passes only when its rule wraps or
> reuses an @eslint/css rule (D16). Any other tailwindcss/ change stops the
> run with a QUESTION.

## Edits

1. Run `mise x -- mise run p:build`, then lint `tests/fixtures/css/valid.css`
   with `node dist/index.js --no-ignore tests/fixtures/css/valid.css`. If it
   reports a problem, fix only that CSS in the fixture (D19).
2. Run `mise x -- mise run test:golden --update`. It builds, then writes
   `tests/golden/__snapshots__/` again.
3. Examine `git diff --stat tests/golden/__snapshots__/` and the diff itself.
   Pass condition: only `config/file.css.json` and the CSS entries of
   `lint/problems.json` and `lint/fixes.json` change. In
   `config/file.css.json`, the `language` is `css/css`, the 15
   `tailwindcss/` rule keys that the preset sets keep their severities, and
   any other change is in a `css/` rule, or in a `tailwindcss/` rule that
   wraps or reuses an `@eslint/css` rule (D16; read the rule source to
   tell). If any other file or entry changes, return a QUESTION with the diff
   summary.
4. Run the full wave gate: `mise x -- mise run code:lint` and
   `mise x -- mise run code:check`.

## Verification

- `mise x -- mise run test:golden` passes with no `--update`.
- `mise x -- mise run p:test` passes.

## Guardrails

- Change only `tests/golden/__snapshots__/` and, by D19,
  `tests/fixtures/css/valid.css`. Never run a bare `dprint fmt`.
- Do not bump a version.
- Delete with `rm`, never `git rm`.

## Commit

`test(tests): write the golden snapshots again for @eslint/css 2.0.1`
