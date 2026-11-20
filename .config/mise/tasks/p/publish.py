#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Publish to npm from this machine (fallback; prefer CI/OIDC release)"
# MISE tools={uv="latest", python="3.14"}

# USAGE flag "--dry-run" help="Validate the publish without uploading"

import os
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def run(*args):
  """Run a tool of mise, and stop the task with its code when it fails."""
  result = helpers.tool(*args)
  if result.returncode != 0:
    sys.exit(result.returncode)


def mise_run(*args):
  """Run a mise task, and stop the task with its code when it fails."""
  result = subprocess.run(["mise", "run", *args], check=False)
  if result.returncode != 0:
    sys.exit(result.returncode)


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  dry_run = os.environ.get("usage_dry_run", "false") == "true"

  helpers.print_header("Publishing the package to npm ...")
  helpers.print_subheader("Checking the npm authentication ...")
  run("npm", "whoami")
  helpers.print_subheader("Running the tests ...")
  mise_run("p:test")
  helpers.print_subheader("Building the package ...")
  mise_run("p:build")

  if dry_run:
    helpers.print_subheader("Validating the publish (dry run) ...")
    run("npm", "publish", "--access", "public", "--dry-run")
    helpers.print_success("Dry run complete")
    return

  helpers.print_subheader("Publishing to the npm registry ...")
  run("npm", "publish", "--access", "public")
  helpers.print_success("Publish complete")


if __name__ == "__main__":
  main()
