#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Build the CLI"
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
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header("Building the package ...")
  run("pnpm", "run", "build")
  helpers.print_success("Build complete")


if __name__ == "__main__":
  main()
