# The artifact: what the publish fields define

## The public surface is `bin` plus `exports`

For a CLI, `bin` is the contract users type. For anything imported, the
`exports` map is the contract. In this repo those are `.` and `./auto`, the
VS Code entry. A subpath not listed in `exports` cannot be imported
(`ERR_PACKAGE_PATH_NOT_EXPORTED`, per Node's packages docs), and
that is the point: internal modules stay changeable (principles catalog:
information-hiding). The map itself is published
knowledge. Removing or renaming an entry is a **major** version, because a
consumer's import breaks without warning. Adding an entry is a minor
version. This is the "some information is the contract" case of the
information-hiding entry, so version it deliberately.

## `version` is set by the release, not by hand

Bootstrap's release task bumps `package.json` (`version = "package.json"` in
the repo's release config), and the release workflow refuses a tag that
does not match it. A hand edit that skips the task produces a tag/manifest
mismatch, and CI stops it.

## Bundling is a declared choice

Every production dependency appears in both `dependencies` and
`bundledDependencies`, so the full resolved tree ships inside the tarball.
This repo states and tests that invariant. A dependency that is added but
not bundled does not reach consumers, and nothing fails until a consumer
installs it. Two consequences follow:

- Pack with pnpm under `nodeLinker: hoisted`. pnpm can pack bundled
  dependencies only from a flat `node_modules` (pnpm `nodeLinker` docs).
- A dependency with per-platform optional binaries bundles only the
  binaries that were installed. The repo forces every platform's binary to
  install (`supportedArchitectures`), and `check-bindings.sh` refuses a
  tarball that is missing one.

Do not bundle by default in other packages. Bundling trades a larger
tarball and manual updates for immunity to transitive drift. Take that
trade only when the drift is the bigger risk (principles catalog: kiss).

## `peerDependencies` is a promise to the consumer

A peer range states which host versions the published code supports. Widen
it only when the code has been tested against the new range.
