DECISION 2026-11-23 ★4 | product:linter | vwf onboard: topology monorepo,
project linter frontend/[cli], every stack axis unresolved | /vwf:setup onboard

# vwf onboarding

Source: the `/vwf:setup` onboard run of 2026-11-23, code sub-path. The user
answered each question.

## Decisions

- **D1** ★4 | product name | `linter`, the repo directory name and the
  bootstrap `repo_name` | alt: `@virajp.dev/linter` — rejected
- **D2** ★4 | topology | `monorepo`, the user's choice: the repo will hold more
  projects, such as the planned site (B03). Today it has one project at the
  repo root | alt: `repo` (one package, one release cadence) — rejected, the
  repo is expected to grow
- **D3** ★3 | layout | the root-level layout differs from the monorepo
  grouping (`projects/` for deployables, `packages/` for libraries). This is a
  written recommendation only: setup moves no source. Revisit it when a second
  project is added
- **D4** ★4 | project `linter` | path `.`, role `frontend`, platforms `[cli]`.
  People run the output in a terminal. The `/auto` export is not recorded as a
  `packages` platform | alt: role `system`; platforms `[cli, packages]` —
  rejected
- **D5** ★4 | stack | every axis is `unresolved`: the project template,
  `backing_template`, `deploy_template` and `repo.stack.template`.
  `/vwf:architecture` decides them. Detected facts: language `typescript`,
  package manager `pnpm` (from `pnpm-lock.yaml`). The candidate
  `typescript-parseargs-cli` covers `cli` only, and its conventions (a tsup
  bundle, `node:util` parseArgs) differ from this repo (`tsc`, its own parser)
  | alt: pin `typescript-parseargs-cli` now — rejected
- **D6** ★2 | harness | every capability is `n/a`: no screen platform, no
  `service` platform, no flows. The plan gates use `code:format`,
  `code:lint`, `code:check`, `code:precommit` and `p:preflight`
- **D7** ★2 | stack plugins | `stacks: [ stackgen ]`

## Repo shape

`/vwf:init` ran on 2026-11-23: a bootstrap sync, the hygiene files
`CONTRIBUTING.md` and `SECURITY.md`, and the ruleset `vwf-main` on the
forge.
