#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Upgrade the dependencies to latest, with the holds of the dependency policy"
# MISE tools={uv="latest", python="3.14"}

import os
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def run(*args, **kwargs):
  """Run a tool of mise, and stop the task with its code when it fails."""
  result = helpers.tool(*args, **kwargs)
  if result.returncode != 0:
    sys.exit(result.returncode)


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header("Upgrading the dependencies ...")

  helpers.print_subheader("Updating pnpm in package.json ...")
  version = helpers.tool("pnpm", "--version", capture_output=True, text=True).stdout.strip()
  run("pnpm", "self-update", version)

  # Resolve in two lockfile-only passes, then materialise node_modules once.
  #
  #   1. Seed the lockfile. `pnpm update --latest` resolves the `latest`
  #      dist-tag even for packages excluded with `!`, ignoring their
  #      package.json range -- on a clean slate (cleanup deletes the lockfile)
  #      that pulls typescript 7, which @typescript-eslint/parser (peer
  #      typescript <6.1) does not support. Given a lockfile that already
  #      pins 6.x, the `!typescript` exclusion leaves that resolution alone.
  #   2. A `pnpm update` that downloads leaks handles on the store index
  #      (~/Library/pnpm/store/v11/index.db) and never exits -- pnpm 11.18.0,
  #      only reproducible against a cold store, which `store prune` in cleanup
  #      guarantees. `--lockfile-only` downloads nothing, so the install below
  #      is the only pass that touches the store.
  helpers.print_subheader("Resolving the dependencies ...")
  run("pnpm", "install", "--lockfile-only")

  helpers.print_subheader("Updating the dependencies to latest ...")
  # Held at their majors, like typescript:
  #   - ajv: 6.x, the ajv-6 API that ESLint also uses (areOptionsValid test
  #     helper).
  #   - @types/react: 18.x, the version the typescript rule test fixtures name.
  run(
    "pnpm",
    "--recursive",
    "update",
    "--latest",
    "!typescript",
    "!ajv",
    "!@types/react",
    "--lockfile-only",
  )

  helpers.print_subheader("Installing the node modules ...")
  run("pnpm", "install", "--network-concurrency", "10", "--recursive")
  helpers.print_success("Dependencies upgraded")


if __name__ == "__main__":
  main()
