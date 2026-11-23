# npm registry: pick & trade

## What it is for

A project that consumers **install**: a CLI run through `npx`/`bunx`, or a
library that another package depends on. The registry is the host. There is
no environment to deploy into, nothing to keep warm and nothing to scale.

## What it costs

- **Releases cannot be withdrawn.** A version's number can never be reused.
  Unpublishing is allowed within 72 hours, and after that only when the
  package meets npm's unpublish criteria. Otherwise the remedy is
  `npm deprecate`, which leaves the version installable and shows a
  warning. So every publish is a commitment, and the release pipeline has to
  catch mistakes before the upload, not after it (npm unpublish policy).
- **The consumer's machine is the run environment.** It can be any OS, CPU,
  libc or Node version the package claims to support. Anything the artifact
  assumes about the build host fails on a consumer's machine. A tarball
  packed on one platform that carries a native binary for that platform only
  is the usual case. In this repo `.github/scripts/check-bindings.sh` and
  the per-platform smoke matrix exist because that happened.
- **Publication is the exposure.** A public package is readable by anyone,
  so access control is the visibility setting and nothing more. A scoped
  package is published private by default, and a public scoped package needs
  `--access public` on its first publish (npm scoped-public docs).

## When it stops being the answer

- **The project needs a running service.** Then it needs a deploy target
  that runs something, with a readiness endpoint. A registry cannot hold one.
- **The consumers are only inside this workspace.** A workspace dependency
  needs no publish at all, and a publish adds an immutable public record
  for no reader (principles catalog: yagni).
- **The artifact must stay private, and the organisation has no private
  scope or private registry.** In that case it is not this target yet.

## This repo's choice

`@virajp.dev/linter` is a public, scoped CLI with `bin` and `exports`, and
every production dependency is bundled into the tarball. The trade is taken
on purpose: consumers get one pre-resolved tree, and the tarball is large
(about 36 MB) and carries native bindings for every platform. That makes
the per-platform checks a release gate, not a nicety.
