export function runHelp(): void {
  console.log(`@askviraj/linter [options] [files...]

Options:
  --init              Scaffold eslint.config.mjs and .config/linter.yaml;
                      update .vscode/settings.json if it exists
  --force             Overwrite existing files when used with --init
  --fix               Automatically fix problems
  --cache             Only check changed files
  --cache-location    Path to the cache file or directory
  --no-ignore         Disable use of ignore files
  --quiet             Report errors only
  --debug             Enable debug logging
  --format, -f        Use a specific output format
  --max-warnings      Number of warnings to trigger nonzero exit code
  --version, -v       Show version
  --help, -h          Show help
`);
}
