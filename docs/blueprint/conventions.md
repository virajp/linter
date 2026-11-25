---
type: vwf-conventions
title: Conventions
description: Cross-cutting decisions referenced by entity docs.
status: draft
---

# Conventions

Cross-cutting decisions referenced by entity docs. Define once; entity docs link
to the relevant anchors rather than repeating.

## Auth {#auth}

The product has no accounts and no authentication.

- **Users.** Each user is anonymous and local. A user runs the command on their
  own machine or on a pipeline runner. The product stores no identity, no user
  record and no role.
- **Operators.** There is one operator: the sole maintainer. The maintainer
  acts only through the source repository and the release pipeline, never
  inside the product.
- **Access.** The product checks no permission. The operating system controls
  which files a run can read and write.

## Errors {#errors}

Each run ends with an exit code and, on failure, one message on stderr.

| Exit code | When                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `0`       | The run found no lint errors, and the warnings are not more than the maximum that the user sets.          |
| `1`       | The run found one or more lint errors, the warnings are more than that maximum, or the run itself failed. |

- A run failure is, for example, an unknown flag or a configuration that is not
  valid.
- An error message is one line on stderr. It says what happened and what to do
  next.
- No other exit code exists.
- The presentation rules (streams, color, help text) are the
  [terminal UX contract](./design-system.md#terminal-ux).

## Observability {#observability}

The product has no telemetry. It runs on the user's machine and sends no data
off it.

- **No signals.** The product exports no traces, no metrics and no logs. It
  collects no usage data.
- **Debug output.** The debug flag turns on the diagnostic output of the
  checker. That output goes to stderr, on the user's own terminal only.
- **Result format.** The format flag selects the result format. A machine
  format gives pipelines a stable, parseable result.
- **No health endpoint.** No project is deployed as a service, so nothing
  serves a health check.
- **No PII.** Nothing leaves the machine, so no personal data reaches a
  third party.

## Config {#config}

- **Source.** One file, `.config/linter.yaml`, in the consuming repository.
  Its shape is the [Linter Config](./entities/linter-config/index.md) entity.
- **Lookup.** A run walks up from the working directory. The first
  `.config/linter.yaml` it finds is the one it uses. When no file exists, the
  run uses the defaults.
- **Same for each entry point.** The command line and the code editor read the
  same file in the same way.
- **No secrets.** The product needs no secret, no credential and no
  environment variable to run. The file holds no secret.
- **No environment inventory.** There is no external integration and no secret,
  so the product has no `environment.md`.

## Testing {#testing}

Four test layers must pass before a release.

| Layer       | What it proves                                                                             |
| ----------- | ------------------------------------------------------------------------------------------ |
| Unit        | Each part works alone: argument parsing, presets, configuration merge, init.               |
| Integration | The built command works end to end on fixture files, with real lint output and real flags. |
| Golden      | Snapshots of the shipped configuration and of its lint results and fixes stay unchanged.   |
| Smoke       | The packed package, and the published package, run on each supported platform.             |

- **Golden snapshots.** A change to a rule, a problem or a fix fails the golden
  layer. The maintainer examines the difference, then accepts it by updating
  the snapshots in the same change. Exception: the weekly dependency refresh
  ([flow 130](./flows/linter/130-dependency-refresh/index.md)) accepts the
  changed snapshots itself; the difference shows in its release commit for
  review after the release.
- **Fixtures.** Each language has one valid fixture, which must lint clean, and
  one or more fixtures that must report a problem.
- **Smoke matrix.** The smoke run covers each operating system and processor
  combination that the package supports. A platform that cannot load the
  package fails the run.

## Reliability targets {#reliability}

The product has no service-level objective, because no project runs as a
service. It has no capacity numbers, because it serves no requests.

The reliability bar is the release gates instead:

- **Golden snapshots.** No release changes the shipped configuration by
  accident (see [testing](#testing)).
- **Smoke matrix.** Each release runs on each supported platform, first as the
  packed package and then as the published package.
- **Release lag.** A tool release that includes each core release ships 7 days
  or fewer after it ([goal](./product.md#goal-no-drift)).
  - A core release is a new version of any bundled package. A major version
    that the dependency policy holds is not a core release.
  - The lag counts from the publish date of that version to the tool release
    that includes it.
  - A week that a failed gate blocks counts against the target.

**Stance on a missed bar.** A failed gate blocks the release. The fix ships as
the next version.

## Disaster recovery {#disaster-recovery}

The product has no datastore, so there is no backup, no recovery point and no
recovery time objective.

- **Published versions.** Each published version is immutable in the package
  registry. A consumer can always install a version that was published before.
- **Source.** The full source and its history are in version control. Any
  version can be built again from its release tag.
- **Local cache.** The optional cache file on the user's machine can be
  re-derived. Its loss costs one full run.

## Incident response {#incidents}

There is one owner, the sole maintainer. There is no on-call rotation.

| Condition                                    | Destination                  | Runbook                   |
| -------------------------------------------- | ---------------------------- | ------------------------- |
| The release pipeline fails                   | The forge notifies the owner | [Fix forward](#incidents) |
| The smoke run on the published package fails | The forge notifies the owner | [Fix forward](#incidents) |

**Fix forward.** Find the cause and fix it. Then release the next version.
Never move or delete a pushed release tag. A version whose release failed stays
unpublished.

- **No other runbooks.** Health triage does not apply, because no project runs
  as a service. DR restore does not apply, because there is no datastore.
- **Postmortems.** Each incident gets a problem record under
  `docs/memory/problems/`.

## Engineering baseline {#baseline}

The default technical rules that apply to this product. Each deviation has a
note here and a waiver in the vwf configuration.

- **`baseline/boundary-validation`** — every input **and output** crossing a
  boundary (API request/response, event payload, job payload, stored write) is
  validated against its schema; malformed data is **rejected, never coerced or
  passed through**. The schemas are the blueprint's `schema.yaml` / OpenAPI
  contracts realized in code.
  - **Deviation — [Linter Config](./entities/linter-config/index.md).** These
    cases give a warning and are ignored, so the file stays
    forward-compatible: an unknown top-level key, an unknown preset name, and
    an unknown key inside an `overrides.<preset>` entry. A missing version, or a
    value of the wrong type, is still rejected. Waiver:
    `baseline/boundary-validation/entities/linter-config`.
- **`baseline/business-technical-separation`** — business logic and technical
  plumbing never mix in one module: technical concerns (persistence, transport,
  third-party SDKs, logging, config) live in **common/shared layers** consumed
  by business code; business rules never live inside technical helpers. The
  workspace placement rules (`rules/schemas-in-common`,
  `rules/integrations-via-common` — seeded under `#patterns`) are this rule's
  workspace-shaped realization. Backing services are **attached resources**
  (12factor IV): reached only through injected config
  (`environment.md`-catalogued), swappable without a code change — never a
  hardcoded host, bucket, or queue name.

**Inapplicable rules.** These rules have no surface in this product, so they
are neither enforced nor waived:

- **No datastore.** The product stores no entity. So
  `baseline/write-versioning`, `baseline/atomic-multi-write`,
  `baseline/server-time`, `baseline/soft-delete` and
  `baseline/expand-contract` have nothing to apply to.
- **No API and no remote call.** The product publishes no API and calls no
  remote operation at run time. So `baseline/idempotency-keys`,
  `baseline/error-envelope`, `baseline/cursor-pagination` and
  `baseline/retry-discipline` have nothing to apply to. The one error shape of
  the command is [errors](#errors).
- **No events and no long-running process.** The product sends no event or
  message, and each run is one short process. So `baseline/tolerant-reader`,
  `baseline/stateless-processes` and `baseline/graceful-shutdown` have nothing
  to apply to.
- **No product log.** The product writes no log and has no telemetry
  pipeline. The debug flag turns on an opt-in diagnostic of the bundled
  checker, not a product log. So `baseline/structured-logs-no-pii` has nothing
  to apply to.
- **No money.** The product handles no money and no precise quantity. So
  `baseline/integer-money` has nothing to apply to.

## Delivery pipeline {#pipeline}

**Environments.**

| Canonical     | Who it serves               | Built from | Deployed by                                                   |
| ------------- | --------------------------- | ---------- | ------------------------------------------------------------- |
| `development` | the developer's own machine | any branch | never — run locally via mise                                  |
| `staging`     | testers only, controlled    | `main`     | no deploy target today — the package registry is the only one |
| `production`  | customers                   | `main`     | a deliberate release act (rule 2) to the package registry     |

The repository `linter` has one core branch, `main`. Staging and production
both release from `main`.

**Release tag.** The release act is a git tag shaped `v<semver>`, for example
`v2.0.1`. It differs from the recommended `<project>-<env>-v<semver>` shape.
Rule 2 allows another mechanism when it still names one project and one
environment per release. This tag does: the repository holds one project, and
production is the only deploy target.

**Rules.**

1. **`pipeline/mise-built`** — CI environments are built by **mise only**: every
   tool a job uses is declared in the repo's mise config and installed from it
   — never a language-setup action, a system package install, or a global
   install.
2. **`pipeline/tag-triggered-deploys`** — a deploy is **deliberate**: an
   explicit, recorded act that names what ships and where, never a side effect
   of a branch push. Merging is not releasing, and `development` is never
   deployed at all. Whatever expresses that act must identify **one project and
   one environment per release** and must be re-validated by the pipeline
   rather than trusted from its trigger.
3. **`pipeline/branch-validated`** — the deploy **proves the commit it is about
   to ship is reachable from the branch that environment releases from**, and
   fails otherwise.
4. **`pipeline/staging-is-not-a-release`** — a staging deploy is a test
   artifact, never a production release: nothing about it is announced,
   changelogged as released, or frozen. A production release is recorded only
   by `/vwf:verify`'s clean run against `production`.
5. **`pipeline/tested-before-release`** — no deploy step runs until the
   released project's tests **and its dependents'** tests pass in the same
   pipeline run. A green commit status from an earlier run does not substitute.
6. **`pipeline/load-proven`** — before the **first production release** of a
   flow whose declared peak rate meets a threshold (default `~10/s`), a load
   run on staging demonstrates the stated SLO holds at the declared peak;
   evidence linked in the release record.
7. **`pipeline/rollback-path`** — every production deploy has a **stated
   rollback**: the previous release tag remains deployable, and a release
   containing a stored-schema change is N-1 compatible per
   `baseline/expand-contract`. The release act records its rollback target; a
   release that genuinely cannot roll back says so in the release record.
8. **`pipeline/dependency-audit`** — every pipeline run that can lead to a
   release runs the ecosystem's lockfile vulnerability audit, and a
   **known-critical advisory fails the run**. Waivable **per-advisory** —
   `pipeline/dependency-audit/<advisory-id>`, with a reason **and a date**.
   - **Waived advisory — GHSA-238p-pmpm-9mq7** (low, since 2026-10-09). No
     fix in the allowed range: the markdown math extension needs a version
     before the fix. Waiver:
     `pipeline/dependency-audit/GHSA-238p-pmpm-9mq7`.
