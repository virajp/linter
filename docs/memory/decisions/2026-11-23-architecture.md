DECISION 2026-11-23 ★4 | product:linter | first registry: one cli project,
deploy and cicd pinned, project and repo axes deferred | /vwf:architecture
derivation

# First architecture and registry

Source: the `/vwf:architecture` derivation run of 2026-11-23, from
`docs/blueprint/product.md`. The user answered each question. The registry and
`architecture.md` record the shape; this record keeps the rationale.

## Decisions

- **D1** ★4 | shared code | no shared package: the CLI and the editor entry
  point share the base configuration inside one project | alt: extract a
  shared config package — rejected, no stack template covers a `packages`
  project
- **D2** ★3 | project axis | `unresolved` again: the repo builds with `tsc`,
  has its own argument parser and its own lint self-config, and no shipped
  bundle fits | alt: `typescript-parseargs-cli`, `typescript-effect-cli`,
  `generated/<slug>` — rejected for now
- **D3** ★3 | deploy and cicd | `npm-package` and `github-actions`: they
  match how the tool ships today. `/vwf:setup` lands them; a declined landing
  blocks | alt: defer deploy; generate a cicd bundle — rejected
- **D4** ★2 | repo axis | `unresolved`; one root package today | alt:
  `pnpm-workspace`, `pnpm-turbo`, `bun` — rejected for now
- **D5** ★3 | core foundations | adapted, not deferred, because the tool is
  already published: no accounts, local debug output, release gates as the
  reliability bar, immutable registry and version control as DR, solo-owner
  incident response | alt: `deferred-preprod` — rejected, it blocks
  production-bound plans
- **D6** ★2 | electives and auth/integrations | not applicable to a local CLI
  with no service, no user data and no hosted spend; omitted from the registry
