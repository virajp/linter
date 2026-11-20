#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Run the release.yml pack checks locally: tests, bundled bindings, smoke"
# MISE tools={uv="latest", python="3.14"}

import glob
import os
import platform
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def run(*args, **kwargs):
  """Run a tool of mise, and stop the task with its code when it fails."""
  result = helpers.tool(*args, **kwargs)
  if result.returncode != 0:
    sys.exit(result.returncode)


def mise_run(*args):
  """Run a mise task, and stop the task with its code when it fails."""
  result = subprocess.run(["mise", "run", *args], check=False)
  if result.returncode != 0:
    sys.exit(result.returncode)


def main():
  os.chdir(os.environ["MISE_PROJECT_ROOT"])
  helpers.print_header("Running the release preflight ...")
  with tempfile.TemporaryDirectory() as pack_dir:
    try:
      helpers.print_subheader("Running the tests ...")
      mise_run("p:test")

      helpers.print_subheader("Packing the tarball ...")
      run("pnpm", "pack", "--pack-destination", pack_dir, stdout=subprocess.DEVNULL)
      tarball = glob.glob(f"{pack_dir}/*.tgz")[0]

      helpers.print_subheader("Checking the bundled native bindings ...")
      run("bash", ".github/scripts/check-bindings.sh", tarball)

      helpers.print_subheader("Smoke testing the tarball ...")
      run("node", ".github/scripts/smoke.mjs", tarball)
    finally:
      # pnpm pack and pnpm run build can prune node_modules: restore it.
      helpers.tool("pnpm", "install", "--frozen-lockfile", stdout=subprocess.DEVNULL)

  helpers.print_success(f"Preflight passed on {platform.system()}-{platform.machine()}")
  helpers.print_warn("release.yml still smoke tests the other platforms.")


if __name__ == "__main__":
  main()
