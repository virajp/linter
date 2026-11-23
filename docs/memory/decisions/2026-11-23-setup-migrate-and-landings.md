DECISION 2026-11-23 ★3 | product:linter | setup migrate to config 28 /
blueprint 26; npm-package and github-actions landed; hook skipped | /vwf:setup
migrate

# Setup migrate and the first stack landings

Source: the `/vwf:setup` run of 2026-11-23 that `/vwf:architecture` handed
off to. The vwf plugin changed on the same day, so the run was a migrate, not
a materialize only. The user answered each question.

## Decisions

- **D1** ★3 | migrate | the repo facts (`product_name`, `topology`,
  `topology_reason`) moved into bootstrap's `repo.toml`; the registry has no
  `path` now (`vwf_registry: 3`) | alt: stop and run setup in a fresh session
  — rejected
- **D2** ★3 | `npm-package` landing | landed in full, with the disclosure that
  the reviewer gate used 4 of 4 rounds and the last citation fix was not
  reviewed again, and that `npm@12.2.3` has no provenance on deps.dev | alt:
  deselect the `eslint` and `ux-gate` skills; decline — rejected
- **D3** ★3 | the `npm-normalize` hook | skipped: no `.claude/settings.json`,
  the script stays inert | alt: wire the PreToolUse hook — rejected
- **D4** ★2 | `github-actions` landing | landed in full. Its doctrine differs
  from `release.yml` today (tag shape, branch validation, idempotent re-run,
  job-level `id-token`, concurrency, release environment, action pins). These
  are reported only; no workflow was edited
