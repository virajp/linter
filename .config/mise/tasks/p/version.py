#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Bump package version (no git tag)"
# MISE tools={uv="latest", python="3.14"}

# USAGE flag "--minor" help="Bump the minor version"
# USAGE flag "--major" help="Bump the major version"

import json
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


def flag(name):
  """Whether the # USAGE flag name is set."""
  return os.environ.get(f"usage_{name}", "false") == "true"


def require_clean():
  """Stop the task when the working tree is not clean."""
  status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
  if status.stdout.strip():
    helpers.print_error("Working tree is not clean. Commit or stash changes first.")
    sys.exit(1)


def package_version():
  """The version of package.json."""
  with open("package.json") as f:
    return json.load(f)["version"]


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  require_clean()
  bump = "major" if flag("major") else "minor" if flag("minor") else "patch"
  helpers.print_header(f"Bumping the {bump} version ...")
  run("pnpm", "version", bump, "--no-git-tag-version")
  helpers.print_success(f"Version is now v{package_version()}")


if __name__ == "__main__":
  main()
