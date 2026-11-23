# npm registry: promotion & release

## One tarball, tested, then uploaded

A registry has no environments to promote between. What gets promoted is
**the tarball**. It is packed once, checked, and then the same file is
uploaded (`npm publish` accepts a tarball path, per the npm-publish docs). A
second pack at publish time can differ from the first, and then the tested
artifact and the released artifact are different files. Two repo facts
follow. The tarball is packed with `pnpm`, because pnpm can publish
`bundledDependencies` only from a hoisted `node_modules` (pnpm `nodeLinker`
docs). The upload is `npm`'s, because trusted publishing runs through the
npm CLI. Which jobs run in what order is the CI system's to define.

## Trusted publishing, not a token

Publish through npm **trusted publishing (OIDC)**. The CI run gets
short-lived credentials, and no long-lived token exists that could leak.
That is least privilege (principles catalog: least-privilege) carried out
by the registry. When the publish comes from GitHub Actions or GitLab CI/CD,
from a public repository, for a public package, npm adds provenance
automatically (npm trusted-publishers docs). These facts bind what the
release task may assume:

- npm CLI 11.5.1 or later and Node 22.14.0 or later.
- A cloud-hosted runner. Self-hosted runners are not supported.
- The trusted publisher is bound to the workflow **file name**. Renaming the
  release workflow breaks publishing until the npmjs.com setting is changed
  to match.
- A package can have up to 10 trusted publishers. This repo's notes say
  "exactly one". Keeping a single publish path is still this repo's choice,
  and a sound one.

Context7 was thin on two of these details: the publisher limit, and the
rule that the workflow file name must include its extension. Both rest on
one read of npm's trusted-publishers page on 2026-11-23. Check that page
again before relying on either one.

- Optional, stricter: stage-only trusted publishers (`npm stage publish`)
  plus "disallow tokens" on the package. Each CI publish then waits for a
  maintainer to approve it with 2FA.

The local fallback (`mise run p:publish`) cannot add provenance. npm
generates provenance only on a supported cloud CI/CD provider with a
cloud-hosted runner (npm provenance docs). So the fallback is the
exception path, not the release path.

## The publish is idempotent, keyed on name, version and integrity

idempotency (principles catalog: idempotency) applies with full force
here, because the upload cannot be undone. A re-run of a release that died
after the upload must not turn into a red build. It also must not hide a
different file published under the same number. The release task, and any
CI step that calls it, meets this contract:

- **Key:** `name@version`. The registry already enforces it, because a
  version can never be published twice (npm unpublish policy).
- **Same-tarball replay:** the registry stores a sha512 `integrity` for each
  published version (npm-publish docs), and `npm view <name>@<version>
  dist.integrity` reads it (npm-view docs). If it equals the local
  tarball's integrity, the replay is a **skip**, and the original publish
  is the outcome.
- **Different tarball, same version:** if the integrities differ, the run
  **fails** and says so. Never re-version silently. The fix is the next
  patch.

The CI system decides how a pipeline wires this rule in. This repo's
release workflow implements part of it today: it skips only when a manual
dispatch input asks for a skip, and it compares versions, not integrity.
Closing that gap is a change to the CI system, not to this target.

## Versioning and tags

The published version **is** the release record. It is semver, and the git
tag carries the same number. This repo's tag shape comes from bootstrap's
release config (`release.linter.prod.tag = "v{version}"`), and the release
checks that the tag matches `package.json`.

This target answers to three rules of vwf's delivery-pipeline contract
(`vwf/assets/delivery-pipeline.md`). It cites them and does not restate
them. The CI system implements them.

- **`pipeline/tag-triggered-deploys`.** The release must be a deliberate act
  that names one project and one environment. `<project>-<env>-v<semver>` is
  the contract's recommended default, not a requirement. `v{version}`
  satisfies the rule here, because the repo has one released project
  (`linter`) and one release environment (`prod`), and both are fixed in
  bootstrap's release config. A second released project makes the bare
  `v` tag ambiguous. When that happens, move to the prefixed shape.
- **`pipeline/tested-before-release`.** The tests and the tarball checks
  run in the same run as the upload.
- **`pipeline/rollback-path`.** A registry release **cannot be rolled
  back**. The previous version stays installable, but `latest` and every
  open range already resolve to the new one. That makes the release an
  irreversible step, and the release record has to say so. The remedy is
  deprecation plus the next patch (below), not a rollback.

A prerelease is a semver prerelease (`2.2.0-rc.1`) published with a
non-`latest` dist-tag (`--tag next`). Without that tag the prerelease
becomes `latest`, and everyone who installs without a version gets it (npm
dist-tag docs). This repo has no staging line, so add one only when a
consumer asks for it (principles catalog: yagni).

## Release goes through the repo's tasks

The commands are `mise run release:linter:prod` (bootstrap's release task:
preflight, version bump, signed tag, push) and `mise run p:preflight` (the
pack checks, run locally). CI calls the same checks, so a release found
broken locally is broken the same way in CI.

## Fixing a bad release

Do not move or delete a pushed tag. Do not try to publish over a version.
Run `npm deprecate <name>@<version> "<why>"` on the broken version and
release the next patch (npm unpublish policy).
