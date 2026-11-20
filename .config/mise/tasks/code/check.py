#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Run tsc to check for type errors in the project"
# MISE tools={uv="latest", python="3.14"}

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


def main():
  helpers.print_header("Running tsc to check for type errors ...")
  # The pinned typescript of the project (a bundled dependency), not pnpx or
  # dlx typescript@latest, so the type check matches the shipped version.
  run("pnpm", "exec", "tsc", "--noEmit")
  helpers.print_success("All checks completed")


if __name__ == "__main__":
  main()
