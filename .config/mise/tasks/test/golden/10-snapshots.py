#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Compare the resolved config and the lint output with the golden snapshots"
# MISE tools={uv="latest", python="3.14"}

# USAGE flag "--update" help="write the snapshots again from the current output"

import os
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
  update = ["--update"] if os.environ.get("usage_update", "false") == "true" else []
  helpers.print_header("Running the golden tests ...")
  run("pnpm", "run", "build")
  run("pnpx", "vitest", "run", "tests/golden", *update)


if __name__ == "__main__":
  main()
