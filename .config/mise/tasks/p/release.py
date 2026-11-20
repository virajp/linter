#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Bump version, land it on main, and tag a release (does not push the tag)"
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


def mise_run(*args):
  """Run a mise task, and stop the task with its code when it fails."""
  result = subprocess.run(["mise", "run", *args], check=False)
  if result.returncode != 0:
    sys.exit(result.returncode)


def git(*args):
  """Run git, and stop the task with its code when it fails."""
  result = subprocess.run(["git", *args], check=False)
  if result.returncode != 0:
    sys.exit(result.returncode)


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  require_clean()
  version_flag = ["--major"] if flag("major") else ["--minor"] if flag("minor") else []

  helpers.print_header("Preparing the release ...")
  helpers.print_subheader("Running the release preflight ...")
  mise_run("p:preflight")
  helpers.print_subheader("Bumping the version ...")
  mise_run("p:version", *version_flag)

  # main is protected, so the bump goes on a local branch, and git:merge:main
  # lands it and pushes main. The tag goes on the merge commit of main.
  version = package_version()
  branch = f"release/v{version}"
  helpers.print_subheader(f"Committing v{version} on {branch} ...")
  git("switch", "-c", branch)
  git("add", "package.json")
  git("commit", "-m", f"ops: release v{version}")
  mise_run("git:merge:main", branch)

  helpers.print_subheader(f"Tagging v{version} on main ...")
  git("switch", "main")
  git("branch", "-d", branch)
  git("tag", "--sign", f"v{version}", "-m", f"ops: release v{version}")

  helpers.print_success(f"Release v{version} prepared")
  helpers.print_warn(f"Push the tag to publish via CI: git push origin v{version}")


if __name__ == "__main__":
  main()
