# Hygiene: the `files` allowlist is a correctness control

## Allowlist, never denylist

With a `files` list, only the listed paths are packed, plus the files npm
always includes: `package.json`, README, LICENSE, the `main` file and the
`bin` files. Without one, everything is packed except what an ignore file
excludes (npm package.json docs). The tarball is published knowledge.
Information hiding (principles catalog: information-hiding) says to expose
the contract (`bin`, `exports`, the built output) and nothing about the
insides. A denylist does the opposite: any new local file ships unless
someone remembered to exclude it. This repo lists `dist/` and
`THIRD_PARTY_NOTICES.md`.

The entry's limit applies: the built code under `dist/` is shipped on
purpose. Hiding stops at what `exports` does not name. It does not mean
obfuscating the shipped files.

## The two silent failures

- **A credential in the tarball.** An `.npmrc` with a token, an `.env`, or a
  local config file inside a listed directory. Once published it is public,
  and the version cannot be reused (npm unpublish policy). The only fix is
  to rotate it. least privilege (principles catalog: least-privilege) treats
  CI and publishing as production actors, and a token in an artifact is
  ambient authority handed to every installer.
- **Stale build output.** A file left in `dist/` from an earlier build gets
  packed, because `dist/` is listed. Build into a clean output directory
  before you pack.

## Check the packed file, not the manifest

The release uploads the tarball `pnpm pack` built (the repo's release
pipeline). `npm publish --dry-run` and `npm pack --dry-run` report npm's own
pack (npm-publish docs). That pack is a different one, and in this repo npm
does not pack the bundled tree at all. So check the pnpm tarball: list its
contents, or run `mise run p:preflight`, which packs it, checks the bindings
and smoke-tests it.

## Not a substitute for the secret scanner

gitleaks scans the repository. The pack reads the working tree, which can
hold a correctly gitignored secret file. Each check covers a gap the other
leaves.
