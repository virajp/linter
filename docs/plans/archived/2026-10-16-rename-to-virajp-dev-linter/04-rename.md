# U4 — Rename the package to `@virajp.dev/linter`

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `package.json` (`name` only), `src/cli/commands/help.ts`,
  `src/cli/commands/init.ts`, `src/config-loader.ts`, `tests/unit/init.test.ts`,
  `tests/integration/init-command.test.ts`, `tests/fixtures/markdown/valid.md`,
  `.config/statusline.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing. U1 changed
  `init.ts`, `help.ts`, and the two init tests in wave 1.

## Ruling

The user's request: "rename this package to `@virajp.dev/linter`".

From index.md, assumed decisions:

> 16 — Markdown fixture: Change the name in
> `tests/fixtures/markdown/valid.md:22` (content only).

> 17 — Author email: `askviraj@gmail.com` at `package.json:34` stays. It is not
> the package name.

Rejected: leave the old name in the fixture; change the author email.

## Edits

Replace `@askviraj/linter` with `@virajp.dev/linter` in each place below. Line
numbers are from before U1; U1 can move them in `init.ts`, `help.ts`, and the
tests.

1. **`package.json`** — `:2` `name`. Change nothing else. Do not change
   `version` or the author email at `:34`.
2. **`src/cli/commands/help.ts`** — `:2`, the help banner.
3. **`src/cli/commands/init.ts`** — `:16`, `:17`, `:18` (the scaffold line
   becomes `export { default } from "@virajp.dev/linter/auto"`), `:21`, `:184`,
   and every other old-name string, including any that U1 added.
4. **`src/config-loader.ts`** — `:56`, the warning prefix becomes
   `[@virajp.dev/linter]`.
5. **`tests/unit/init.test.ts`** — `:36`, `:44`, `:75`, and every other
   old-name assertion.
6. **`tests/integration/init-command.test.ts`** — `:52`, `:58`, `:72`, and
   every other old-name assertion.
7. **`tests/fixtures/markdown/valid.md`** — `:22`, content only. The fixture
   must still lint clean.
8. **`.config/statusline.json`** — `:3` `projectName`.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run code:lint`
- `mise x -- mise run code:check`
- `mise x -- mise run p:test`
- `command grep -rni askviraj package.json src tests .config/statusline.json`
  returns only `package.json:34` (the email).

## Guardrails

- Touch nothing outside the owned paths.
- Do not change the bin name `linter`, `exports`, `version`, or the author
  email.
- Do not edit `readme.md`, `CLAUDE.md`, or `.github/**`. Report falsified docs
  as `DOCS FALSIFIED:` lines.
- `tests/` is excluded from the formatter and the linter. Never run a bare
  `dprint fmt`.
- Do not run `pnpm install`. The package name change does not change
  `pnpm-lock.yaml`. If `pnpm` reports a lockfile change, report a `GAP:`.
- Delete with `rm`, never `git rm`.

## Commit

`feat: rename the package to @virajp.dev/linter`
