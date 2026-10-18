DECISION 2026-10-16 ★4 | package:linter | rename @askviraj/linter →
@virajp.dev/linter 2.0.0; tombstone sunset/ + npm deprecate | plan
docs/plans/2026-10-16-rename-to-virajp-dev-linter

# Rename to @virajp.dev/linter

Source: `docs/plans/2026-10-16-rename-to-virajp-dev-linter/index.md`, assumed
decisions 1, 2, 5 to 8, 13, 19 and 21. D24 was decided after the landing.

## Reversals

- **R1** 2026-10-16 ★4 | sequence | rename first, in the current single-package
  shape; `/vwf:setup` (`cli` + `site` reshape, B02) comes after | reverses the
  2026-10-09 decision to run `/vwf:setup` before the rename | alt: setup first;
  rename inside the setup reshape — rejected
- **R2** 2026-10-16 ★4 | first version | `@virajp.dev/linter` starts at 2.0.0
  (`p:release --major` from 1.1.9), not 1.0.0 | the tag `v1.0.0` exists and a
  pushed tag is never moved; the `v*` tag scheme stays | reverses backlog B01
  "released as v1.0.0" | alt: 1.0.0 with a new tag scheme; 1.2.0 — rejected

## Tombstone (`sunset/`)

- **D5** ★3 | deprecation method | `sunset/` publishes a last
  `@askviraj/linter`, then `npm deprecate "@askviraj/linter@*"`; both are hand
  steps | alt: `npm deprecate` only; a working final release — rejected
- **D6** ★2 | tombstone version | 2.0.0 (a major bump over 1.1.9) | alt: 1.2.0
  — rejected
- **D7** ★3 | tombstone imports | `exports` maps `.` and `./auto` to one module;
  its import throws an `Error` with the move message and the new import line |
  alt: bin only — rejected
- **D8** ★3 | tombstone bin | `linter` ignores all arguments, writes the move
  message to stderr, writes nothing to stdout, exits 1 | alt: exit 0; honor
  `--help` — rejected
- **D21** 2026-10-18 ★2 | tombstone exit | set `process.exitCode = 1`, do not
  call `process.exit`, so the stderr write completes | alt: `process.exit(1)`
  — rejected

- **D24** 2026-10-18 ★4 | old package removed (supersedes D5 to D8 and D21) |
  the user deleted `@askviraj/linter` from npm instead of a tombstone and
  `npm deprecate`, because only the user used it; `sunset/` was removed from
  the repo and was never published | alt: publish the tombstone, then
  deprecate — rejected

## First CI publish of the new name

- **D13** ★3 | first CI publish | npm cannot add a Trusted Publisher to a
  package that does not exist, so 2.0.0 is published by hand; `release.yml`
  must then not fail on a version that is already on npm; `smoke-published`
  still runs | alt: accept one red run; a placeholder `0.0.0` publish — rejected
- **D19** 2026-10-18 ★4 | publish skip (amends D13) | the skip is not
  automatic: the publish job skips only when a `workflow_dispatch` input
  `skip-publish` is `true` and `npm view <name>@<version>` returns that
  version; a tag push never skips; `skip-publish: true` for a version that is
  not on npm fails | why: an automatic skip let a registry copy stand in for
  the CI tarball with no check (U5 security finding) | alt: automatic skip;
  integrity compare; accept the risk — rejected
