# npm registry: config & secrets at run time

## The package carries none

A published tarball is the same file for every consumer and stays that way
forever. It must hold no environment-specific configuration and no secret.
A secret that reaches a published version cannot be recalled. Unpublishing
is limited, and the version may already be cached or mirrored. The only fix
is to **rotate** the secret. A registry is the one target where a
redeploy cannot undo a leak.

## The question moves to the consumer's machine

For a CLI, "configuration at run time" means what the CLI **reads** on the
user's machine: its flags, its environment variables and its own per-user
or per-repo config file. In this repo that is `.config/linter.yaml`, found
by walking up from the current directory. The blueprint's environment
catalogue records the **names** the CLI reads. It never records values, and
the package embeds no values. This is least privilege's environment
contract (principles catalog: least-privilege): names are catalogued,
values are injected, and nothing is committed.

## Publish-time credentials are not run-time configuration

The OIDC exchange in CI and a maintainer's npm login on the fallback path
both belong to the **publisher**. Neither may reach the package. Never
commit an `.npmrc` that holds an auth token. A committed publish credential
is a standing grant, while OIDC issues one for each run (principles
catalog: least-privilege). The `files` allowlist (the
`npm-package-manifest` skill) is what keeps a stray credential file out of
the tarball.
