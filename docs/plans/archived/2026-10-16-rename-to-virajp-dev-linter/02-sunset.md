# U2 — Tombstone package for `@askviraj/linter`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `sunset/**` (new: `sunset/package.json`, `sunset/linter.mjs`,
  `sunset/auto.mjs`, `sunset/readme.md`)
- **Model:** opus
- **Kind:** edit
- **Read first:** the precedent in
  `/Users/virajpatel/Projects/github.com/virajp/claude-plugins/sunset/`
  (`package.json`, `ai-plugins.mjs`, `readme.md`). Read it; do not copy its
  names.
- **Lazy-load:** the root `package.json` (`license`, `repository`)

## Ruling

From index.md, assumed decisions:

> 5 — Deprecation method: A `sunset/` tombstone package publishes a last
> `@askviraj/linter` version, then `npm deprecate`. Both are hand steps.

> 6 — Tombstone version: `2.0.0`.

> 7 — Tombstone imports: `exports` maps `.` and `./auto` to one module. Its
> import throws an `Error` with the move message and the new import line.

> 8 — Tombstone bin: The bin `linter` ignores all arguments, prints the move
> message to stderr, prints nothing to stdout, and exits 1.

> 15 — Tombstone test: Only U2's verification runs the bin and the import. No
> permanent vitest test, because the user publishes the tombstone once by hand.

Rejected: `npm deprecate` only; a working final release; version `1.2.0`; bin
only, with no `./auto` export; exit 0 or honor `--help`; a permanent test.

## Edits

1. **`sunset/package.json`** — a standalone package. It is not a workspace
   member and has no build and no dependencies:
   - `name` `@askviraj/linter`, `version` `2.0.0`
   - `description` `Sunset. This package moved to @virajp.dev/linter.`
   - `license` `MIT`
   - `repository` `{ "type": "git", "url":
     "git+https://github.com/virajp/linter.git" }`
   - `type` `module`
   - `bin` `{ "linter": "./linter.mjs" }`
   - `exports` `{ ".": "./auto.mjs", "./auto": "./auto.mjs" }`
   - `files` `["auto.mjs", "linter.mjs", "readme.md"]`
2. **`sunset/linter.mjs`** — starts with `#!/usr/bin/env node`. Imports only
   `node:process`. Ignores `process.argv`. Writes this text to stderr, then
   calls `process.exit(1)`:

   ```text
   @askviraj/linter has moved to @virajp.dev/linter.

     npx @virajp.dev/linter [flags] [files...]
     bunx --bun @virajp.dev/linter [flags] [files...]

   In eslint.config.mjs, change the import to:

     export { default } from "@virajp.dev/linter/auto";

   https://github.com/virajp/linter
   This package lints nothing and will not be updated again.
   ```

3. **`sunset/auto.mjs`** — throws at import time:
   `throw new Error(<message>)`. The message names `@virajp.dev/linter`, gives
   the line `export { default } from "@virajp.dev/linter/auto";`, and gives
   `https://github.com/virajp/linter`.
4. **`sunset/readme.md`** — a short readme: the package moved to
   `@virajp.dev/linter`; the new `npx` command; the new import line for
   `eslint.config.mjs`; the repository URL. Write it in ASD-STE100 Simplified
   Technical English.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run code:lint` (it lints `sunset/` too)
- In `sunset/`: `node linter.mjs --help` prints the message to stderr, prints
  nothing to stdout, and exits 1.
- In `sunset/`: `node -e 'import("./auto.mjs")'` exits non-zero, and the error
  output contains `@virajp.dev/linter/auto`.
- In `sunset/`: `npm pack --dry-run` lists only `package.json`, `linter.mjs`,
  `auto.mjs`, and `readme.md`. Do not run `npm publish`.

## Guardrails

- Touch nothing outside `sunset/`.
- Do not run `npm publish`, `npm deprecate`, or `npm login`. They are hand
  steps.
- Do not add `sunset/` to `pnpm-workspace.yaml` or to the root `package.json`.
- If the self-lint config reports a rule violation in `sunset/*.mjs` that the
  required behavior causes (for example `process.exit`), use a narrow
  `eslint-disable-next-line` with a reason. Report it as `DECIDED:`.
- The `sort-package-json` pre-commit hook can reorder the keys. That is
  correct.
- Delete with `rm`, never `git rm`.

## Commit

`feat: add sunset tombstone package for @askviraj/linter`
