---
name: npm-package-manifest
version: 0.1.0
category: development
description: >-
  The publish fields of a published package's package.json, meaning name,
  version, files, bin, exports and bundled dependencies. Treat them as the
  definition of the registry artifact, and the files allowlist as a
  correctness control that keeps build state and credentials out of an
  immutable tarball. Auto-applies when editing package.json.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "package.json"
  - "**/package.json"
---

# The registry manifest: publish fields

This skill covers only the fields that decide **what the registry gets**.
Dependency declaration, ranges and lockfile discipline belong to the
package manager's own doctrine.

| Doing                                                    | Read                                   |
| -------------------------------------------------------- | -------------------------------------- |
| Changing `name`, `version`, `bin`, `exports` or bundling | [The artifact](references/artifact.md) |
| Changing `files`, or checking what the tarball contains  | [Hygiene](references/hygiene.md)       |

**The rule that does not wait for a reference:** `files` is an allowlist,
and the tarball contains exactly what `pnpm pack` produces. Check the
packed file before you trust a manifest edit.
