---
type: vwf-change-plan
title: Rename to @virajp.dev/linter and skip an absent .vscode/settings.json
requires: []
backlog: []
backlog_pieces: []
---

# Plan — Rename to @virajp.dev/linter and skip an absent .vscode/settings.json (2026-10-16)

## Status

**RUNNING**

RUNNING since 2026-10-18 00:12 in
/Users/virajpatel/Projects/github.com/virajp/linter/.worktrees/2026-10-16-rename-to-virajp-dev-linter

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt, and `run` is the only mode. This plan has no after-landing
step.

## Release levels

| Project  | Level | Reason                                                                                  |
| -------- | ----- | --------------------------------------------------------------------------------------- |
| `linter` | MAJOR | The package name changes. Consumers must change their install and their `/auto` import. |
| `sunset` | NONE  | The user publishes it once by hand. The release task never publishes it.                |

## Goal

After this plan lands, the repository builds and tests the package as
`@virajp.dev/linter`. A new `sunset/` package is ready for a last
`@askviraj/linter` publish that tells users to move. `--init` edits
`.vscode/settings.json` only when the file exists.

The user asked for three things: rename the package to `@virajp.dev/linter`,
deprecate `@askviraj/linter` and point users to the new package, and edit
`.vscode/settings.json` only if it exists. The plan does the code and the docs.
The publish and the deprecation are hand steps after the landing (see
**Parked**).

Two reversals of standing decisions:

- **R1.** On 2026-10-09 the user decided to run `/vwf:setup` (the `cli` +
  `site` reshape) before the rename. The user now does the rename first, in the
  current single-package shape.
- **R2.** Backlog item B01 says "released as v1.0.0". The first
  `@virajp.dev/linter` version is now **2.0.0**, because the tag `v1.0.0`
  already exists. The `v*` tag scheme stays.

## Facts the survey established

- `package.json`: `name` `@askviraj/linter` (line 2), `version` `1.1.9`
  (line 3), `bin` `{ "linter": "dist/index.js" }`, `exports` `.` and `./auto`,
  `files` `["dist/"]`, no `publishConfig`. `package.json:34` is the author email
  `askviraj@gmail.com`. It is not the package name.
- No code reads the package name from `package.json` at runtime. Every runtime
  use is hard-coded. `src/cli/commands/version.ts` reads only `version` and
  `dependencies`.
- `pnpm-workspace.yaml` has no `packages:` list, so a new `sunset/` directory is
  not a workspace member. `tsconfig.build.json` includes only `src/**/*`.
- The old name has 54 hits in 16 tracked files. `pnpm-lock.yaml` has none.
  `graphify-out/` (gitignored) has 389 hits.
  - Runtime: `src/cli/commands/help.ts:2`; `src/cli/commands/init.ts:16`, `:17`,
    `:18` (the scaffold line `export { default } from "@askviraj/linter/auto"`),
    `:21`, `:184`; `src/config-loader.ts:56`.
  - Tests: `tests/unit/init.test.ts:36`, `:44`, `:75`;
    `tests/integration/init-command.test.ts:52`, `:58`, `:72`;
    `tests/fixtures/markdown/valid.md:22`.
  - CI: `.github/workflows/release.yml:183` (`SPEC`);
    `.github/workflows/deps-update.yml:96` (comment);
    `.github/scripts/smoke.mjs:1`, `:10`, `:11` (comments), `:37`
    (`PACKAGE_NAME`, used at `:79` and `:159`);
    `.github/scripts/check-bindings.sh:9` (comment).
  - Other: `.config/statusline.json:3` (`projectName`).
  - Docs: `readme.md:1`, `:22`, `:25`, `:32`, `:35`, `:42`, `:45`, `:48`, `:51`,
    `:149`, `:157`, `:170`; `CLAUDE.md:8`, `:109`, `:161`, `:162`, `:187`,
    `:189`, `:294`.
- `--init` and `.vscode/settings.json` today (`src/cli/commands/init.ts`):
  - `:42-44` defines the one key `"eslint.useFlatConfig": true`.
  - `:61-94` `updateVsCodeSettings` edits the file with `jsonc-parser`.
  - `:150-182` the settings step. It creates `.vscode/` (`:151-154`) and creates
    the file (`:169-182`) when they do not exist. An existing file is merged:
    `up-to-date`, `updated`, or `failed`.
  - `--force` has no effect on the settings file. It applies only to
    `eslint.config.mjs` (`:109`) and `.config/linter.yaml` (`:133`).
  - `:184-187` prints a header and one `  [action] <path>` line per file.
    `:189-195` prints a `--force` hint when any file is `skipped`.
  - `src/cli/commands/help.ts:5` says "Scaffold eslint.config.mjs and
    .config/linter.yaml". It does not name `.vscode/settings.json`.
- Tests for the settings step: `tests/unit/init.test.ts:48` (creates the file),
  `:56`, `:67`, `:78`, `:89`; `tests/integration/init-command.test.ts:29`
  (asserts that the file exists at `:34`), `:37`, `:45`, `:61`.
- Docs for the settings step: `readme.md:78`, `:151`, `:153`;
  `CLAUDE.md:192-193`.
- Release mechanics:
  - `release.yml` runs on a `v*` tag push or by hand with `dry-run`. Jobs:
    `pack` (`:23`), `verify-tarball` (`:76`), `publish` (`:124`,
    `npm publish "$(ls *.tgz)" --access public` at `:148`), `smoke-published`
    (`:162`, polls `npm view "$SPEC"` at `:200`). The tag must equal
    `v<package.json version>` (`:35-42`). The publish job has no check for a
    version that is already on npm.
  - `p:release` runs `p:preflight`, bumps the version, commits
    `ops: release vX.Y.Z`, and makes a signed tag. It does not push.
  - `p:publish` runs `npm publish --access public` from the directory, not from
    a packed tarball.
- Tags: `v1.0.0`, `v1.0.2`, `v1.0.3`, `v1.0.5`, `v1.1.0` to `v1.1.9`. `v2.0.0`
  does not exist.
- npm (2026-10-15): `@virajp.dev/linter` returns E404. `@askviraj/linter` is
  `1.1.9` (`latest`) and is not deprecated. `npm whoami` returns E401.
  `@virajp.dev/claude-plugins` is on npm, so the user published under the
  `@virajp.dev` scope before.
- Precedent: claude-plugins
  `docs/plans/archived/2026-09-04-rename-to-claude-plugins/`. Its `sunset/`
  package (`package.json`, a dependency-free bin `.mjs`, `readme.md`) prints a
  move message to stderr and exits 1. Its version was a major bump over the
  last real version. The user published it by hand and ran `npm deprecate`.
  The first publish of the new name was by hand, then the Trusted Publisher was
  added, then CI published.
- Gates: `mise tasks` has `code:format`, `code:lint`, `code:check`, `p:test`,
  `p:preflight`. No workflow runs on push or pull request.
- Before this plan, a separate `ops:` commit on `main` replaced the broken
  `dprint.json` symlink with `dprint.jsonc` (it extends
  `~/.config/dprint/dprint.jsonc`) and reformatted 29 files to that config. The
  line numbers in this plan are from after that commit. On 2026-10-16 all four
  wave gate lines passed on that state.
- Commit convention (`.config/git-conventional-commits.yaml`): types `feat`,
  `fix`, `refactor`, `wip`, `spec`, `test`, `ops`, `docs`, `merge`. No scopes.
- `jsonc-parser` `3.3.1` is a bundled dependency. Only `init.ts` uses it.

## Assumed decisions — confirm or override at review

| #  | Decision                 | Ruling                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                           | Unit   |
| -- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 1  | Sequence                 | Do the rename before `/vwf:setup`, in the current single-package shape (reversal R1).                                                                                                                                                                                                                                                                                       | Setup first; rename inside the setup reshape       | U6     |
| 2  | First new version        | 2.0.0 (reversal R2). No unit bumps the version. `p:release --major` bumps it after the landing.                                                                                                                                                                                                                                                                             | 1.0.0 with a new tag scheme; 1.2.0                 | U6     |
| 3  | Plan count               | One plan for the rename and the `.vscode/settings.json` change.                                                                                                                                                                                                                                                                                                             | Two chained plans                                  | index  |
| 4  | Backlog                  | Ignore the backlog for now. `backlog: []` and `backlog_pieces: []`.                                                                                                                                                                                                                                                                                                         | B01 on `backlog_pieces:`; B01 on `backlog:`        | index  |
| 5  | Deprecation method       | A `sunset/` tombstone package publishes a last `@askviraj/linter` version, then `npm deprecate`. Both are hand steps.                                                                                                                                                                                                                                                       | `npm deprecate` only; a working final release      | U2     |
| 6  | Tombstone version        | `2.0.0`.                                                                                                                                                                                                                                                                                                                                                                    | `1.2.0`                                            | U2     |
| 7  | Tombstone imports        | `exports` maps `.` and `./auto` to one module. Its import throws an `Error` with the move message and the new import line.                                                                                                                                                                                                                                                  | Bin only                                           | U2     |
| 8  | Tombstone bin            | The bin `linter` ignores all arguments, prints the move message to stderr, prints nothing to stdout, and exits 1.                                                                                                                                                                                                                                                           | Exit 0; honor `--help`                             | U2     |
| 9  | Absent settings file     | If `.vscode/settings.json` does not exist, `--init` does not create `.vscode/` or the file. It prints `[skipped] <path>`. `--force` does not change this.                                                                                                                                                                                                                   | A new `[not found]` label; print nothing           | U1     |
| 10 | `--force` hint           | The hint prints only when `eslint.config.mjs` or `.config/linter.yaml` is skipped.                                                                                                                                                                                                                                                                                          | Unchanged hint                                     | U1     |
| 11 | Help text                | The `--init` line in `help.ts` says that it also updates `.vscode/settings.json` if the file exists.                                                                                                                                                                                                                                                                        | Leave the text as it is                            | U1     |
| 12 | Consumer migration       | `readme.md` gets a section "Migrate from @askviraj/linter". No new code.                                                                                                                                                                                                                                                                                                    | `--init` rewrites the old import                   | U6     |
| 13 | First CI publish         | The `release.yml` publish job skips the publish when `npm view <name>@<version>` already exists. The `smoke-published` job still runs.                                                                                                                                                                                                                                      | Accept one red run; a placeholder `0.0.0` publish  | U3     |
| 14 | Review row               | One `review` row in wave 3. The plan lands runnable code: `init.ts`, the tombstone bin and module, `release.yml`, `smoke.mjs`.                                                                                                                                                                                                                                              | No review row                                      | U5     |
| 15 | Tombstone test           | Only U2's verification runs the bin and the import. No permanent vitest test, because the user publishes the tombstone once by hand.                                                                                                                                                                                                                                        | `tests/unit/sunset.test.ts`                        | U2     |
| 16 | Markdown fixture         | Change the name in `tests/fixtures/markdown/valid.md:22` (content only).                                                                                                                                                                                                                                                                                                    | Leave the old name                                 | U4     |
| 17 | Author email             | `askviraj@gmail.com` at `package.json:34` stays. It is not the package name.                                                                                                                                                                                                                                                                                                | Change it                                          | U4     |
| 18 | Model                    | `opus` for every unit.                                                                                                                                                                                                                                                                                                                                                      | —                                                  | all    |
| 19 | Publish skip (amends 13) | Ruled 2026-10-18 at U5 (security finding `release.yml:152`). `release.yml` skips the publish only when a `workflow_dispatch` input `skip-publish` is `true` and `npm view <name>@<version>` already returns that version. A tag push never skips. A dispatch with `skip-publish: true` for a version that is not on npm fails.                                              | Automatic skip; integrity compare; accept the risk | U3     |
| 20 | Unparseable settings     | Ruled 2026-10-18 at U5 (`init.ts:68`). If an existing `.vscode/settings.json` has no JSON root (empty, comments only, or not JSON), `--init` does not overwrite it. It records `[failed]` and prints the existing error message. This replaces "without change" in U1 Edits 1.                                                                                              | Overwrite with a new object                        | U4     |
| 21 | Tombstone exit           | Ruled 2026-10-18 at U5 (`sunset/linter.mjs:25`). The bin sets `process.exitCode = 1` and does not call `process.exit`, so the stderr write completes. This replaces `process.exit(1)` in U2 Edits 2.                                                                                                                                                                        | `process.exit(1)`                                  | U2     |
| 22 | Monthly cron             | Ruled 2026-10-18 at U5 (gap G1). Parked hand step 0 disables `deps-update.yml` before the landing; hand step 8 enables it again. No code change.                                                                                                                                                                                                                            | A guard step in `deps-update.yml`; gap only        | Parked |
| 23 | Settings syntax errors   | Ruled 2026-10-18 at U5 round 2 (gap G3). If `parseTree` reports any syntax error in an existing `.vscode/settings.json`, `--init` does not write the file. It records `[failed]` and prints the existing error message, as decision 20 does. Amended 2026-10-18 at U5 round 3 (gap G4): a leading UTF-8 BOM is not a syntax error. The file is merged, and the BOM is kept. | Merge anyway; gap only                             | U4     |

## New dependencies

None. The tombstone imports only `node:process`.

## Units

| Id | Wave | Unit file                                  | Kind   | Owns                                                                                                                                                                                                                               | Depends on     | Status  | Commit  |
| -- | ---- | ------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------- |
| U1 | 1    | [01-settings-json.md](01-settings-json.md) | edit   | `src/cli/commands/init.ts`, `src/cli/commands/help.ts`, `tests/unit/init.test.ts`, `tests/integration/init-command.test.ts`                                                                                                        | —              | green   | 99a7024 |
| U2 | 1    | [02-sunset.md](02-sunset.md)               | edit   | `sunset/**`                                                                                                                                                                                                                        | —              | green   | 4885209 |
| U3 | 1    | [03-ci.md](03-ci.md)                       | edit   | `.github/workflows/release.yml`, `.github/workflows/deps-update.yml`, `.github/scripts/smoke.mjs`, `.github/scripts/check-bindings.sh`                                                                                             | —              | green   | 05ea198 |
| U4 | 2    | [04-rename.md](04-rename.md)               | edit   | `package.json`, `src/cli/commands/help.ts`, `src/cli/commands/init.ts`, `src/config-loader.ts`, `tests/unit/init.test.ts`, `tests/integration/init-command.test.ts`, `tests/fixtures/markdown/valid.md`, `.config/statusline.json` | U1             | green   | 51d6f07 |
| U5 | 3    | [05-review.md](05-review.md)               | review | —                                                                                                                                                                                                                                  | U1, U2, U3, U4 | green   |         |
| U6 | 4    | [06-docs.md](06-docs.md)                   | edit   | `readme.md`, `CLAUDE.md`, `docs/memory/decisions/2026-10-16-rename-to-virajp-dev-linter.md`                                                                                                                                        | all            | pending |         |
| U7 | 5    | [07-gates.md](07-gates.md)                 | edit   | none                                                                                                                                                                                                                               | U6             | pending |         |

## Shared-file rule

| File                                                                | Why it collides                                    | Owner                    |
| ------------------------------------------------------------------- | -------------------------------------------------- | ------------------------ |
| `src/cli/commands/init.ts`, `src/cli/commands/help.ts`              | U1 changes behavior; U4 changes the name           | U1 (wave 1), U4 (wave 2) |
| `tests/unit/init.test.ts`, `tests/integration/init-command.test.ts` | U1 changes the settings tests; U4 changes the name | U1 (wave 1), U4 (wave 2) |
| `package.json`                                                      | the version belongs to the release task            | U4, `name` only          |
| `readme.md`, `CLAUDE.md`, `docs/**`                                 | several units falsify the same docs                | U6 only                  |
| `graphify-out/**`                                                   | generated and gitignored                           | nobody (out of scope)    |

## Waves

- **Wave 1:** U1, U2, U3. Their owned paths are disjoint. U3 changes
  `smoke.mjs` `PACKAGE_NAME` before U4 changes the `package.json` name. The wave
  gate does not run `smoke.mjs`, so this order breaks no gate.
- **Wave 2:** U4. It edits `init.ts`, `help.ts`, and the two init tests after
  U1, so the rename also applies to the text that U1 wrote.
- **Wave 3:** U5, the review of U1 to U4.
- **Wave 4:** U6, the docs unit.
- **Wave 5:** U7, the gates unit.

## Wave gate

```text
mise x -- mise run code:format
mise x -- mise run code:lint
mise x -- mise run code:check
mise x -- mise run p:test
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

none

## Gates the orchestrator keeps

- `mise x -- mise run p:preflight` passes. It packs
  `virajp.dev-linter-1.1.9.tgz`,
  examines the bundled bindings, and runs `smoke.mjs` with the new
  `PACKAGE_NAME`. Pass: exit 0.
- In `sunset/`, `node linter.mjs --help` prints the move message to stderr,
  prints nothing to stdout, and exits 1.
- In `sunset/`, `node -e 'import("./auto.mjs")'` fails, and the error output
  contains `@virajp.dev/linter/auto`.
- In `sunset/`, `npm pack --dry-run` lists only `package.json`, `linter.mjs`,
  `auto.mjs`, and `readme.md`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm`. It stages
nothing.

A unit returns exactly this block and nothing else. No file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- The `/vwf:setup` reshape to `cli` + `site` (B02). The user does the rename
  first (R1).
- The linter website (B03). It goes through the blueprint chain.
- The GitHub repository name. It stays `virajp/linter`.
- The bin name `linter`. It has no scope, so it does not change.
- The author email `askviraj@gmail.com`. It is not the package name.
- `graphify-out/`. It is gitignored and is regenerated.
- The old `v*` tags. They stay. A pushed tag is never moved or deleted.
- The backlog. The user said to ignore it for now (decision 4).
- Any `npm publish`, `npm deprecate`, Trusted Publisher change, version bump,
  tag, or push of a tag. These are hand steps (see **Parked**).

## Parked

Hand steps after the landing, in this order. The plan does not do them.

0. Before 2026-11-01, run `gh workflow disable deps-update.yml` (decision 22).
   Otherwise the 2026-11-01 cron can push the tag `v1.1.10` under the new name
   before step 4.
1. Run `npm login`. On 2026-10-15, `npm whoami` returned E401.
2. Run `mise x -- mise run p:release --major`. This makes 1.1.9 → 2.0.0, the
   commit `ops: release v2.0.0`, and the signed tag `v2.0.0`. It does not push.
3. Publish 2.0.0 by hand: run `pnpm pack`, then
   `npm publish virajp.dev-linter-2.0.0.tgz --access public`. npm cannot set a
   Trusted Publisher for a package that does not exist.
4. On npmjs.com, add the Trusted Publisher for `@virajp.dev/linter`: repository
   `virajp/linter`, workflow `release.yml`.
5. Run `git push && git push origin v2.0.0`. The tag push starts `release.yml`,
   which does not skip (decision 19). Cancel that run with `gh run cancel`.
   Then run `gh workflow run release.yml --ref v2.0.0 -f skip-publish=true`.
   That run skips the publish and smoke-tests the published package.
6. In `sunset/`, run `npm publish --access public`.
7. Run
   `npm deprecate "@askviraj/linter@*" "Moved to @virajp.dev/linter — run: npx
   @virajp.dev/linter"`.
8. Run `gh workflow enable deps-update.yml` (decision 22).

Other items:

- `p:publish` runs `npm publish` from the directory, not from a packed tarball.
  CI publishes a packed tarball because of `bundledDependencies`. Hand step 3
  therefore uses `pnpm pack`. A fix of `p:publish` is a later plan.
- Backlog item B01 is not updated by this plan (decision 4). After the hand
  steps, set it with `/vwf:backlog done B01`.

## Gaps surfaced during execution

- **G1 (U5, plan gap, closed by decision 22).** The Parked hand steps do not
  deal with the
  monthly `deps-update.yml` cron. Its next run is 2026-11-01. If it runs on
  `main` before hand steps 2 to 5, it pushes a bot commit and the tag `v1.1.10`,
  and the publish fails because `@virajp.dev/linter` and its Trusted Publisher
  do not exist yet.
- **G2 (U5, plan gap, open).** Parked hand step 3 publishes a new `pnpm pack`
  tarball that `check-bindings.sh` does not examine. Because of decision 13, CI
  never publishes its own examined 2.0.0 tarball.
- **G3 (U5 round 2, plan gap, closed by decision 23).** Decision 20 rules only
  the no-root case.
  A `.vscode/settings.json` with JSONC syntax errors but a recoverable root
  (`init.ts:62`, `parseTree` with no errors array) is still merged, written back
  more damaged, and reported `[updated]`. Example: `{ "a": [1, }`. The behavior
  is older than this branch, and U1 Edits 1 kept it.
- **G4 (U5 round 3, oscillation, closed by the amendment to decision 23; the
  user overrode the guard).** The round 2 fix for decision 23 counts
  a leading UTF-8 BOM as a syntax error, so a BOM `.vscode/settings.json` that
  VS Code reads is now `[failed]` (`init.ts:71`). The convergence guard stopped
  the loop: round 2 had 1 finding, round 3 had 1.

## Run log

| Wave | Unit             | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                          | Commit  |
| ---- | ---------------- | ----- | ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 0    | preflight        | —     | 1     | pass        | doctor: repo not onboarded (no .config/vwf.yaml), no blocking finding; no code unit, so no LSP or conventions step; format check skipped (no covers:); wave gate 4/4 green (109 tests); bootstrap: pnpm install --frozen-lockfile (no setup:worktree task, user ruling)                                                                         | —       |
| —    | acceptance       | —     | —     | skipped     | why: no covers:                                                                                                                                                                                                                                                                                                                                 | —       |
| 1    | U2 sunset        | opus  | 1     | pass        | edit: 4 files under sunset/; DECIDED: package.json has only the planned fields (no author/engines); GAP: executable bit on linter.mjs not specified — set chmod +x                                                                                                                                                                              | —       |
| 1    | U1 settings-json | opus  | 1     | pass        | edit: init.ts, help.ts, 2 init tests (113 tests pass); DECIDED: hint filter excludes the settings path; restart note kept; VSCODE_SETTINGS const kept for unparseable-file fallback; DOCS FALSIFIED: readme.md:78, :151, :153; CLAUDE.md:109, :187, :192-193                                                                                    | —       |
| 1    | U3 ci            | opus  | 1     | pass        | edit: release.yml (SPEC, skip-if-published step, needs pack+verify-tarball), deps-update.yml, smoke.mjs, check-bindings.sh; DECIDED: name read from package.json; skip compares npm view output, not exit code; DOCS FALSIFIED: CLAUDE.md Releasing, Trusted Publisher config                                                                   | —       |
| 1    | R1               | opus  | 1     | findings(2) | CONTRACT clean; RULINGS clean; sunset/readme.md:16-17 [U2] rule 3 — 'this message' has no referent → loop to U2; CLAUDE.md:167 [U1] rule 5 — CLI Reference --init row → DOCS FALSIFIED handed to U6 (U6 owns CLAUDE.md)                                                                                                                         | —       |
| 1    | U2 sunset        | opus  | 2     | pass        | edit: sunset/readme.md:16-19 rewritten — says the bin writes the new package name to stderr and exits 1                                                                                                                                                                                                                                         | —       |
| 1    | R1               | opus  | 2     | pass        | 0 findings; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                       | —       |
| 2    | U4 rename        | opus  | 1     | pass        | edit: 8 owned files, one sed of the exact string; only package.json:34 (email) keeps askviraj; 113 tests pass; DOCS FALSIFIED: readme.md and CLAUDE.md, every @askviraj/linter passage                                                                                                                                                          | —       |
| 2    | R2               | opus  | 1     | pass        | 0 findings; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                       | —       |
| 2    | gate             | —     | 1     | pass        | wave 2 gate: format red on the orchestrator's unformatted Run log row only (index.md); re-run on the committed tree green; lint, check, p:test (113) green                                                                                                                                                                                      | —       |
| 3    | U5 review        | opus  | 1     | findings(1) | security: range 6f977aa..5e204ca, 16 files, map U1-U4; engine: 0 vulns; [low] release.yml:152 (U3) — skip-if-published accepts a registry copy without checking it matches the CI tarball; VERDICT approve; tag U5/security/1                                                                                                                   | —       |
| 3    | U5 review        | opus  | 1     | findings(2) | review: range 6f977aa..5e204ca; engine 10 findings, 9 in range + 1 out of range (index.md:265, unmapped → gap); [low] init.ts:68 (U4) settings overwrite on no JSON root — departs U1 Edits 1; [low] sunset/linter.mjs:25 (U2) process.exit after async write — departs U2 Edits 2; API COMPAT n/a; VERDICT approve; tags U5/review/1, U5/gap/1 | —       |
| 3    | U2 sunset        | opus  | 3     | pass        | U5 loop-back: linter.mjs sets process.exitCode = 1 (decision 21); gates: --help to stderr only, exit 1; import fails with the new line; pack lists 4 files                                                                                                                                                                                      | 4fceae8 |
| 3    | U3 ci            | opus  | 2     | pass        | U5 loop-back (security): skip-publish dispatch input; tag push never skips; skip with no version on npm fails (decision 19); DOCS FALSIFIED: CLAUDE.md Releasing (skip-publish input)                                                                                                                                                           | 2e1f14b |
| 3    | U4 rename        | opus  | 2     | pass        | U5 loop-back: no JSON root → throw → [failed], file unchanged (decision 20); VSCODE_SETTINGS removed; 3 new tests; 116 tests pass                                                                                                                                                                                                               | 7407e54 |
| 3    | U5 review        | opus  | 2     | pass        | security: range 6f977aa..7407e54; engine 0 vulns; round 1 finding fixed (2e1f14b); VERDICT approve; tag U5/security/2                                                                                                                                                                                                                           | —       |
| 3    | U5 review        | opus  | 2     | findings(1) | review: range 6f977aa..7407e54; round 1 findings fixed; [low] tests/unit/init.test.ts:144 (U4) test.each copies captureLog; gap G3 (U5/gap/2); engine findings 2,3,4,7,9,10 not raised by reviewer; VERDICT approve; tag U5/review/2                                                                                                            | —       |
| 3    | U4 rename        | opus  | 3     | pass        | U5 round 2 loop-back: parseTree errors array + allowTrailingComma → syntax error throws → [failed] (decision 23); captureLogAndError reused; 118 tests pass                                                                                                                                                                                     | 421239c |
| 3    | U5 review        | opus  | 3     | pass        | security: range 6f977aa..421239c; engine 0 vulns; VERDICT approve; tag U5/security/3                                                                                                                                                                                                                                                            | —       |
| 3    | U5 review        | opus  | 3     | findings(1) | review: range 6f977aa..421239c; round 2 finding fixed; [medium] init.ts:71 (U4) BOM settings.json now [failed] — regression from 421239c (decision 23 text); gap G4 (U5/gap/3); convergence guard: count 1 → 1, not strictly lower; VERDICT changes-required; tag U5/review/3                                                                   | —       |
| 3    | U4 rename        | opus  | 4     | pass        | U5 round 3 loop-back: ignore the one BOM InvalidSymbol (offset 0, length 1); BOM kept; 2 tests; 120 tests pass; note: the unit ran a git stash by mistake, applied and dropped only its own entry                                                                                                                                               | 027c570 |
| 3    | U5 review        | opus  | 4     | pass        | security: range 6f977aa..027c570; engine 0 vulns; VERDICT approve; tag U5/security/4                                                                                                                                                                                                                                                            | —       |
| 3    | U5 review        | opus  | 4     | pass        | review: range 6f977aa..027c570; round 3 finding fixed; 0 findings; VERDICT approve; tag U5/review/4; U5 green after 4 rounds (cap 4), no contested finding                                                                                                                                                                                      | —       |
| 3    | R3               | opus  | 1     | pass        | 0 findings over the U5 fix commits (5e204ca..HEAD); CONTRACT clean; RULINGS clean (decisions 19-23)                                                                                                                                                                                                                                             | —       |
| 3    | gate             | —     | 1     | pass        | wave 3 gate 4/4 green (120 tests)                                                                                                                                                                                                                                                                                                               | —       |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree, cut from the integration branch, can see it.

Run in a fresh context: a fresh session, or a runner that `all` dispatches.

/vwf:execute docs/plans/2026-10-16-rename-to-virajp-dev-linter

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
