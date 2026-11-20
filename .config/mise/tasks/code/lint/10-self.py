#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.14"
# dependencies = []
# ///
# MISE description="Lint the files with the source config of this repository"
# MISE hide=true
# MISE tools={uv="latest", python="3.14"}

# USAGE flag "--all" help="lint every file of the repository"
# USAGE flag "--debug" help="emit debug logs"
# USAGE flag "--fix" help="apply fixes"
# USAGE arg "[files]" var=#true help="the files to lint; the default is the uncommitted files"
# FILES include="*.astro *.css *.html *.json *.jsonc *.md *.toml *.yaml *.yml *.js *.mjs *.cjs *.jsx *.ts *.mts *.cts *.tsx tsconfig.json tsconfig.*.json tsconfig-strict.json **/.vscode/*.json" exclude="tests/** **/node_modules/ **/dist/ **/.turbo/ **/.astro/ **/*.d.ts **/AGENTS.md .agents/**/*.md .claude/**/*.md .github/**/*.md **/worktrees/** **/.worktrees/** **/superpowers/** **/coverage/** graphify-out/** **/graphify-out/**"

import os
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, f"{os.environ['MISE_PROJECT_ROOT']}/.config/mise/tasks/_scripts")
import helpers  # noqa: E402


def flag(name):
  """Whether the # USAGE flag name is set."""
  return os.environ.get(f"usage_{name}", "false") == "true"


def main():
  # The self-lint: eslint with src/eslint.config.ts, the source of the linter.
  # code:lint:05-linter runs the published package. Without the installed
  # eslint, the task does not apply and prints nothing.
  root = os.environ["MISE_PROJECT_ROOT"]
  os.chdir(root)
  if not os.path.exists("node_modules/.bin/eslint"):
    return 0

  args = ["--all"] if flag("all") else []
  flags = [f"--{name}" for name in ("debug", "fix") if flag(name)]
  file_list = helpers.gate_files(__file__, *args, *flags, *helpers.usage_files())
  try:
    if os.path.getsize(file_list) == 0:
      return 0

    helpers.print_header("Linting the files with the source config ...")
    with open(file_list, "rb") as f:
      names = f.read().replace(b"\n", b"\0")
    eslint = [
      "mise",
      "x",
      "--",
      f"{root}/node_modules/.bin/eslint",
      "--no-config-lookup",
      "--config",
      f"{root}/src/eslint.config.ts",
      "--color",
      "--pass-on-no-patterns",
      "--concurrency",
      "auto",
      "--no-error-on-unmatched-pattern",
      "--no-warn-ignored",
    ]
    if flag("debug"):
      eslint.append("--debug")
    if flag("fix"):
      eslint.append("--fix")
    result = subprocess.run(["xargs", "-0", *eslint], input=names, check=False)
    return result.returncode
  finally:
    os.remove(file_list)


if __name__ == "__main__":
  sys.exit(main())
