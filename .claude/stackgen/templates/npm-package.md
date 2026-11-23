---
slug: npm-package
axis: deploy
kind: deploy-target
tools: []
packs:
  - deploy-target/npm-registry@generated
languages: []
optional_languages: []
frameworks: []
dependencies: []
capabilities: []
artifact: npm-package
---

# Deploy — Package registry · npm

The target for a project users **install** rather than one you run: a CLI, or a
library published outside the workspace. The registry is the host; there is no
environment to deploy into and nothing to keep warm.

## Artifact

One published package per project, built from the workspace and pruned to what
consumers need — the `files` allowlist, the `bin` entry for a CLI, and an
`exports` map for a library. The tarball is the only artifact; it carries no
environment-specific configuration, because a published version is immutable and
the same version is what every consumer resolves.

## Pipeline

Build → `publish`, wrapped in mise `release:*` tasks so the same command runs
locally and in CI.

Publishes obey vwf's delivery-pipeline contract — named here, never copied,
because no path from this plugin spells vwf's root. The caller fetching these
conventions is vwf, which already has it: tag-triggered only, shaped
`<project>-<env>-v<semver>`, branch-validated, and gated on the tagged
project's tests plus its dependents'. Two rules are specific to a registry:

- **Publish from CI with a trusted publisher (OIDC)** rather than a stored
  token, so provenance is attached automatically and no long-lived credential
  exists to leak.
- **The publish step is idempotent** — a version already on the registry is a
  skip, not a failure. Tag re-points and re-runs are then safe, which matters
  because a registry publish cannot be rolled back, only superseded.

## Versioning

The published version **is** the release record — semver, and the same number
the tag carries. A version is never republished with different contents; a
mistake ships as the next patch. There is no promotion between environments: a
`staging` publish is a prerelease tag (`1.4.0-rc.1`) on the same line, not a
separate artifact.

## Configuration and secrets

None ship in the package. A CLI reads configuration from its own flags,
environment, and per-user config file at run time on the user's machine — so the
`environment.md` catalog for this project names what it *reads*, and the package
itself embeds nothing. A published secret is unrecallable; the registry is the
one target where a leak cannot be revoked by redeploying.

## Private plane

A package that must not be public is published **scoped and private** to the
organization, or to a private registry. There is no network layer to hide behind
here: publication *is* the exposure, so the access setting is the whole control.

## Health

Not applicable — nothing is running to probe, so this project carries no entry
under `environments:` and no `harness.health` path. `/vwf:verify` has no URL to
probe for it and says so rather than reporting a failure.

The equivalent post-release check belongs in the pipeline, not in `verify`: an
**install smoke test** that installs the published version from the registry
into a clean environment and runs its entrypoint. Make it the last step of the
publish job — it is the only check that exercises what consumers actually
resolve, rather than what the workspace built.

## npm registry: conventions (generated, deploy-target/npm-registry)

`@virajp.dev/linter` ships to the public npm registry as one scoped package.
The CLI is `bin`, the VS Code entry is `exports["./auto"]`, and the whole
production tree is bundled. Nothing runs, so health is `n/a`. The install
smoke test against the published version takes its place.

**One tarball, tested, then uploaded.** `pnpm pack` builds it once, the
checks run against it, and `npm publish <tarball>` uploads that same file
through trusted publishing (OIDC), which adds provenance automatically. A
fresh pack at publish time breaks the guarantee that the tested file is the
released file.

**A published version is permanent.** Its number can never be reused. Fix
a bad release with `npm deprecate` and the next patch. Never move or delete
a pushed tag.

**The publish must be idempotent, keyed on `name@version` and the
tarball's integrity.** This is the target contract: when the registry's
`dist.integrity` equals the local tarball's, the publish is a skip, and when
they differ, the run fails. The release workflow does not meet it yet. It
skips only on a manual dispatch input, and it compares versions, not
integrity. Closing that gap is a change to the CI system.

**Tags are `v{version}`**, from bootstrap's release config, and they match
`package.json`. The release runs through `mise run release:linter:prod` and
`mise run p:preflight`. `p:publish` is the manual fallback. It cannot add
provenance, because npm
generates provenance only on cloud CI. The workflow is the CI system's. Under
vwf's delivery-pipeline contract
(`pipeline/tag-triggered-deploys`), `<project>-<env>-v<semver>` is the
recommended default. `v{version}` meets the rule while the repo releases
one project to one environment. Under `pipeline/rollback-path`, a registry
release is an irreversible step, so the release record states that.

**No configuration and no secret ship in the package.** What the CLI reads
at run time (flags, environment, `.config/linter.yaml`) is catalogued by
name only. `files` is an allowlist, and the packed tarball is what gets
checked.

Full judgment: the `npm-registry` skill and the `npm-package-manifest`
skill.

## TypeScript — conventions

The Node/TypeScript baseline. New code is TypeScript with `strict` on;
JavaScript files get the same standards minus the type-level rules and are
migration candidates, never an excuse to relax them.

**Errors are values at the boundary and exceptions in the middle.** One mapping
home turns internal failures into the product's coded responses — never
scattered `try`/`catch` that each invent their own shape.

**`async`/`await` throughout; never block the event loop.** CPU-bound work moves
off the main thread rather than being awaited around.

**Tests are Vitest**, colocated, with the shared config and v8 coverage.

**The `@/` path alias, no deep relative chains, and a clean→check→build
pipeline.** Barrels are for public surfaces only.

**Config is read once at the composition root** — names-not-values, catalogued
in the repo's environment catalog, never `process.env` reads scattered through
the code.

**Telemetry is OTLP.** The product emits it and never imports a vendor SDK.

Full judgment: the `typescript` skill's references.

## tsconfig — conventions

**`strict` is on, everywhere, and is not negotiated per project.** The
type-level rules in the TypeScript baseline assume it; without it they are
suggestions.

**One shared base config, extended per project.** A per-project config that
restates the base has already drifted from it.

**The `@/` path alias** replaces deep relative chains, and the build resolves it
the same way the editor does.

**A separate emit variant for builds**, so type checking and emitting are
distinct operations — `tsc --noEmit` is the checker, and nothing about a check
should depend on output settings.

## What this entry writes

No file. This entry's conventions and skill guide the agent when it writes the
`tsconfig*.json` files, which are per-project and belong to the project —
written where the project is, not laid down from here.

Full judgment: the `tsconfig` skill.

## ESLint — conventions

The **correctness** gate for TypeScript and JavaScript. Topic 10 of the language
bundle, deliberately not a repo gate: a linter meaningful for exactly one
toolchain belongs to that toolchain's bundle, or a polyglot repo acquires one
per language.

**Flat config only.**

**Zero formatting rules.** The formatter owns layout — a rule a formatter can
satisfy must never be able to fail a lint run. The repo formatter's config,
which bootstrap ships, is the other half of that split.

**Overrides are scoped by `files` glob**, never disabled globally. A rule turned
off everywhere because one file could not satisfy it is a rule the repo no
longer has.

**One lint command, wired through the task library**, so local and CI run the
identical gate.

## What this entry writes

No file: its skill and these conventions. ESLint runs only inside the house
linter, which bootstrap pins and runs, with its task and its pre-commit hook —
so this entry ships **no task and no pre-commit fragment**.
`mise run code:lint` runs it, and the `lint` hook runs it on each commit. The
house linter reads the whole tree whatever list it is given — its rules are
cross-file.

`.config/linter.yaml`, the linter's own config, is **not** this entry's either:
bootstrap ships it with the other gate configs, because the house linter
reads it in every repo, not on this stack alone. The linter is zero-config
without it, so the file exists to give a misfiring default one obvious place
to be answered. The `eslint` skill still guides every edit to it.

**A disable comment goes on its own line above the offending one**, line style,
so the decision is visible, with its reason written by hand.

Full judgment: the `eslint` skill.

## pnpm — conventions

pnpm is the only package manager. A repo with two lockfiles has two dependency
graphs and resolves differently depending on who ran what.

**The lockfile is committed and authoritative.** CI installs frozen and fails on
drift rather than resolving something new — an install that can resolve
differently in CI than locally is not a gate. `pnpm-lock.yaml` is never edited
by hand, with an editor tool, `sed` or a script: it changes only as the output
of `pnpm install`, `pnpm add`, `pnpm remove` or `pnpm update`, and a merge
conflict in it is resolved by taking either side and running `pnpm install`,
never by merging its lines.

**A publish cooldown guards the supply chain**, so neither a routine install nor
an automated update adopts a release published minutes ago.

**In a workspace, internal dependencies are linked, not versioned**, and shared
versions live in a catalog so one bump moves every package.

**Two settings belong in `.npmrc` at the repo root**, which is the one path
the manager reads them from: `ignore-scripts=true`, so an install never
executes a dependency's install-time code, and `fund=false`, so it never
prints a banner over what it did. This entry does not ship the file; the repo
sets them itself. A dependency that genuinely has to build is allowed by name
in `pnpm-workspace.yaml` (`allowBuilds`; pnpm 11 ignores the older
`onlyBuiltDependencies`) — the exception is a reviewable line, not a switch.

**An agent's `npm`/`npx` command is rewritten before it runs.** This entry
ships `hooks/npm-normalize.sh`, which lands at `.claude/hooks/npm-normalize.sh`
and — once its `hooks.yaml` entry is accepted into `.claude/settings.json` —
resolves the repo's manager from its lockfile and rewrites the command to it.
Declining the settings entry leaves the script landed and inert, which is
safe: the hook only rewrites a command that was going to run the wrong manager
anyway. It allows exactly two managers, pnpm and bun (`npx` → `pnpm dlx` or
`bunx`, `npm ci` → `<pm> install --frozen-lockfile`, any other `npm` → `<pm>`,
flags after `npx` kept verbatim), and resolves which one by walking up from the
working directory: a lockfile first — `bun.lock`/`bun.lockb` or
`pnpm-lock.yaml`, the ground truth, since bun reuses npm's `workspaces` field
and nothing else tells them apart — else pnpm: the walk stops at the
directory that holds `.config/vwf.yaml` and answers pnpm there, and pnpm is
the answer with no lockfile at all, because the hook fires in every repo,
including ones that never heard of vwf.
Its `sed` stays BSD-compatible: no `\s`, no `\b`.

## The tasks are bootstrap's

This entry ships no task. The repo's toolchain — the manager's pin, its
install and upgrade tasks, the formatter, the house linter and the
pre-commit hooks — comes from bootstrap. `mise run setup` installs from the
lockfile and never moves it; `mise run setup --upgrade` moves the lockfile
forward, so a new resolution is always something someone asked for, and the
diff is the review surface. `mise run code:format` and `mise run code:lint`
run the gates.

**A dependency audit is advisory, never a gate.** `pnpm audit` reads a
registry feed that moves without any lockfile change; the blocking
supply-chain check is `code:sec`, which runs pinned tools. `pnpm outdated`
fails whenever it finds anything — a healthy repo's normal state — so it is
never a gate either.

Full judgment: the `pnpm` skill's references.

## Shell as the second language

A project authored in markdown ships shell only where it must — a hook the host
executes, a small check the repo runs. It is never the project's main surface,
and a project with no hooks has no shell at all. That is what makes it optional
rather than absent: the token is admitted, not required.

## Portability is the whole discipline

The script runs on whatever machine installed the project, under whatever shell
the host invokes — not the author's.

- **Target the oldest tool you might meet, not the one on your machine.** On
  macOS that means **BSD `sed`**: no `\s`, no `\b`, no `-i` without an argument.
  A GNU-only expression works for the author and silently fails to match for
  everyone else, which is worse than failing loudly.
- **Prefer the POSIX form when the convenient one is a bashism**, unless the
  script's interpreter line genuinely guarantees bash.
- **Quote every expansion.** An unquoted path with a space is the defect this
  rule exists for, and it only appears on someone else's machine.

## Exit codes are the interface

- **Exit non-zero on failure, and say why on stderr.** A script whose caller is
  a host or a gate communicates only through its exit code and its output;
  anything it prints to stdout may be parsed.
- **A verdict's shape is decided by its caller, never by convention.** Where the
  host defines a response format for the event being handled, that format is the
  contract — emitting a well-formed verdict of the wrong shape reads to the host
  exactly like a script that chose to stay quiet, which is the failure mode that
  hides longest.
- **Guard anything optional.** A script depending on a tool that may be absent
  tests for it and degrades, rather than failing the whole invocation for a
  convenience.

## Keep it small, or stop writing shell

Shell earns its place for a dozen lines of glue. Past that — real argument
parsing, data structures, anything needing tests — the project is better served
by the language it is already written in, or by a task in the repo's own runner.
A long shell script is a decision to revisit, not a style to perfect.

## Markdown as the language

Most projects hold markdown; a few are **written in** it. This component is for
the second case — where the shipped artifact is prose with frontmatter, loaded
by a host that reads it directly, and there is no compile step between what is
authored and what runs.

## What that changes

- **Frontmatter is the interface.** The prose is the payload, but the
  frontmatter is what a host parses to decide whether the file exists at all. It
  is validated like an interface, not like metadata: a key the host does not
  recognize is a typo that fails silently, and a value of the wrong type drops
  the file without an error. Parse it with a **strict** YAML parser in the
  repo's own checks — a lenient one accepting it proves nothing about the host.
- **There is no build, so the review is the gate.** Nothing catches a mistake
  between authoring and loading. Whatever correctness this project has comes
  from checks the repo runs against the authored tree itself, which makes those
  checks load-bearing in a way they are not for a compiled language.
- **The toolchain belongs to the repo axis.** Formatting, linting and link
  checking are repo-wide concerns applied to every markdown file, not a
  language toolchain installed per project. This component installs nothing and
  pins no tool; what runs is whatever the repo's own gates run.

## Placement and structure

- **One directory per unit**, named for the unit, with the entry file at a fixed
  name the host expects. A reader finds a unit by its directory name; nothing
  should have to grep for it.
- **Split by load cost, not by length.** A file loaded on every invocation stays
  small and routes to on-demand references beside it; a file loaded only when
  needed carries whatever it needs to be complete. There is no line cap — a unit
  that outgrew one sitting is decomposed into a router plus references, never
  trimmed to fit a number.
- **Prose is the source of truth for judgment; tables are for lookup.** A
  decision with a reason belongs in prose where the reason survives. A closed
  set of values belongs in a table where it can be scanned.

## What not to do

- **Do not restate the host's own documentation.** A unit that explains what the
  host already explains ages badly and adds nothing; state what *this* project
  decided, and link the host's docs for the rest.
- **Do not encode behavior in prose the host cannot read.** If a rule matters to
  the host, it belongs in frontmatter or in a check. Prose the host never parses
  is a convention for humans, and should be honest about being one.
