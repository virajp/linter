# U7 — Gates

- **Wave:** 5
- **Depends on:** U6
- **Owns:** none. The plan names no generator.
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md, sections "Wave gate" and "Gates the orchestrator
  keeps".

## Ruling

From index.md: the plan names no generator. No unit bumps a version. This unit
runs the full wave gate and the gates the orchestrator keeps. It edits no file.

## Edits

None. If a gate fails, report it as `UNRESOLVED:` with the failing command and
the first error lines. Do not fix it.

## Verification

1. `mise x -- mise run code:format`
2. `mise x -- mise run code:lint`
3. `mise x -- mise run code:check`
4. `mise x -- mise run p:test`
5. `mise x -- mise run p:preflight` exits 0. It packs
   `virajp.dev-linter-1.1.9.tgz`, examines the bindings, and runs `smoke.mjs`
   with the new `PACKAGE_NAME`.
6. In `sunset/`: `node linter.mjs --help` prints the move message to stderr,
   prints nothing to stdout, and exits 1.
7. In `sunset/`: `node -e 'import("./auto.mjs")'` exits non-zero, and the error
   output contains `@virajp.dev/linter/auto`.
8. In `sunset/`: `npm pack --dry-run` lists only `package.json`, `linter.mjs`,
   `auto.mjs`, and `readme.md`.
9. `command grep -rni askviraj --exclude-dir=node_modules --exclude-dir=dist
   --exclude-dir=graphify-out --exclude-dir=.git --exclude-dir=docs .`
   returns only: `package.json:34` (email), `sunset/**`, and the `readme.md`
   and `CLAUDE.md` passages that name the old package on purpose.

## Guardrails

- Edit no file.
- `pnpm pack` and `pnpm run build` can remove packages from `node_modules`. If
  a tool is missing after them, run `pnpm install --frozen-lockfile`.
- Do not run `npm publish`, `npm deprecate`, or a version bump.

## Commit

None, if no file changed. If the gates changed a file (for example a
formatter fix), `ops: pass the final gate for the rename`.
