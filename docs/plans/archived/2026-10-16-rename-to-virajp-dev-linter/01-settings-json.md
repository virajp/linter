# U1 — `--init` edits `.vscode/settings.json` only if it exists

- **Wave:** 1
- **Depends on:** —
- **Owns:** `src/cli/commands/init.ts`, `src/cli/commands/help.ts`,
  `tests/unit/init.test.ts`, `tests/integration/init-command.test.ts`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `src/cli/args.ts` (flag parsing), `tests/helpers/run-unit.ts`,
  `tests/helpers/run-cli.ts`, `tests/helpers/temp-dir.ts`

## Ruling

From index.md, assumed decisions:

> 9 — Absent settings file: If `.vscode/settings.json` does not exist, `--init`
> does not create `.vscode/` or the file. It prints `[skipped] <path>`.
> `--force` does not change this.

> 10 — `--force` hint: The hint prints only when `eslint.config.mjs` or
> `.config/linter.yaml` is skipped.

> 11 — Help text: The `--init` line in `help.ts` says that it also updates
> `.vscode/settings.json` if the file exists.

The user's request: "only edit the `.vscode/settings.json` if it exists,
otherwise skip it".

Rejected: a new `[not found]` label; print nothing for the file; an unchanged
`--force` hint; unchanged help text.

## Edits

1. **`src/cli/commands/init.ts`**
   - In the settings step (`:150-182`), examine whether `.vscode/settings.json`
     exists first. If it does not exist, record the action `skipped` for its
     path and go to the summary. Do not create `.vscode/` (remove the
     `mkdirSync` at `:151-154`) and do not create the file (remove the create
     path at `:169-182`).
   - If the file exists, keep the current merge behavior without change:
     `up-to-date`, `updated`, the unparseable fallback, and `failed` with the
     error after the summary (`:197-202`).
   - `--force` does not change the settings step in any case.
   - Change the `--force` hint (`:189-195`) so that it prints only when
     `eslint.config.mjs` or `.config/linter.yaml` has the action `skipped`. A
     `skipped` settings file alone prints no hint.
   - Keep the restart note (`:204-209`). If you find that the note has no use
     when the settings file was skipped, keep it and report a `GAP:`.
2. **`src/cli/commands/help.ts`** — change the `--init` line (`:5`) so that it
   names all three files. Example:
   `Scaffold eslint.config.mjs and .config/linter.yaml; update
   .vscode/settings.json if it exists`.
   Keep the column layout of the help text. Do not change the package name on
   `:2` (U4 owns that edit).
3. **`tests/unit/init.test.ts`**
   - Replace the test at `:48` ("creates `.vscode/settings.json`") with a test
     that runs init in an empty directory and asserts: `.vscode/` does not
     exist, and the result reports `skipped` for the settings path.
   - Add a test: `.vscode/` exists, `settings.json` does not. Assert that the
     file is not created and the action is `skipped`.
   - Add a test: `--force` with no settings file. Assert that the file is not
     created.
   - Add a test for the hint: only the settings file is skipped → no `--force`
     hint; `eslint.config.mjs` is skipped → the hint prints. Assert on the
     printed output in the way the existing tests capture it. If the unit
     helpers cannot capture output, put the hint test in the integration file.
   - Keep the tests at `:78` and `:89` (existing file). Keep their meaning.
4. **`tests/integration/init-command.test.ts`**
   - `:29` and its assertion at `:34`: assert that `.vscode/settings.json` does
     not exist after `--init` in an empty directory, and that the output has a
     `[skipped]` line for it.
   - `:61` ("the generated settings file enables flat config"): write an
     existing `.vscode/settings.json` first (for example `{}` with a comment),
     run `--init`, then assert `"eslint.useFlatConfig": true` and an
     `[updated]` line.
   - Add an assertion that the `--force` hint is absent when only the settings
     file is skipped.

Do not change the old package name strings in the test files. U4 renames them.

## Verification

- `mise x -- mise run code:lint`
- `mise x -- mise run code:check`
- `mise x -- mise run p:test`
- `command grep -n "mkdirSync" src/cli/commands/init.ts` shows no call for the
  `.vscode` directory.

## Guardrails

- Touch nothing outside the owned paths.
- Do not edit `readme.md` or `CLAUDE.md`. Report each falsified passage as a
  `DOCS FALSIFIED:` line (for example `readme.md:151`, `:153`,
  `CLAUDE.md:192-193`).
- Do not rename `@askviraj/linter` anywhere. U4 does it in wave 2.
- `tests/` is excluded from the formatter and the linter. Never run a bare
  `dprint fmt`. Use `mise x -- mise run code:format --fix` only.
- Delete with `rm`, never `git rm`.

## Commit

`feat: update .vscode/settings.json in --init only when it exists`
