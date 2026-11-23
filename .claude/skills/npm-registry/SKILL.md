---
name: npm-registry
version: 0.1.0
category: development
description: >-
  The npm registry as this product's deploy target, for a project users
  install rather than run. Covers when a registry is the right target, the
  release mechanics that keep a published version immutable and the tested
  tarball the released one, trusted publishing, and why no configuration or
  secret ships in the package.
license: MIT
disable-model-invocation: false
allowed-tools: Read Grep Glob Edit Write Bash
---

# npm registry · published package

The deploy target for a project that is installed, not run. This skill
carries the judgment. The npm CLI's command and flag surface is looked up at
use time, in Context7 when Context7 is installed, else in npm's own
documentation.

Read the reference that matches what you are doing. Read one, not all of them.

| Doing                                                    | Read                                                 |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Choosing this target, or questioning it                  | [Pick & trade](references/pick-and-trade.md)         |
| Releasing, re-running a release, or fixing a bad version | [Promotion & release](references/promotion.md)       |
| Deciding what a published CLI reads at run time          | [Config & secrets](references/config-and-secrets.md) |

Writing the publish fields of `package.json` is the sibling
`npm-package-manifest` skill. It applies automatically while you edit the
manifest.

**The rule that does not wait for a reference:** a published
`name@version` is permanent. It can be deprecated, and within narrow limits
unpublished, but its number can never be used again. A mistake ships as
the next patch.

**Reachability and health do not apply here.** A registry runs nothing, so
there is no readiness endpoint to probe and no `health` harness entry. The
check that takes their place is the install smoke test in the release
pipeline, which runs against what the registry serves.

**Out of scope:** the release workflow file is the CI system's. The build
and test commands belong to the language. The local stack is not this
skill's subject either.
