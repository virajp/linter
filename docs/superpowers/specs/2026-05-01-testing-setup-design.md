# Testing Setup Design for @askviraj/linter

## Overview

Create a comprehensive testing setup for `@askviraj/linter` that validates the
CLI against all supported file types and CLI flags before publishing. Tests are
both functional (asserting specific lint violations are caught) and smoke tests
(asserting flag behavior and exit codes).

## Goals

- Verify the CLI correctly lints all 10+ supported file types
- Verify all CLI flags behave as expected
- Catch regressions before publishing
- Run fast enough for iterative development
- Use temporary directories for full test isolation

## Non-Goals

- Snapshot testing (too brittle with plugin updates)
- Performance benchmarking
- Testing ESLint rules themselves (we test our config + integration, not ESLint
  core)
- GitHub Actions CI workflows (out of scope for this project)

## Architecture

### Directory Structure

```text
tests/
├── fixtures/                    # Comprehensive static fixture files
│   ├── javascript/
│   │   ├── valid.js             # Clean file, should pass
│   │   ├── unused-vars.js       # no-unused-vars violation
│   │   ├── console-usage.js     # no-console violation
│   │   └── eqeqeq.js            # eqeqeq violation
│   ├── typescript/
│   │   ├── valid.ts
│   │   ├── explicit-any.ts      # @typescript-eslint/no-explicit-any
│   │   ├── unused-params.ts     # no-unused-params
│   │   └── prefer-const.ts
│   ├── astro/
│   │   ├── valid.astro
│   │   └── unclosed-tag.astro
│   ├── json/
│   │   ├── valid.json
│   │   └── trailing-comma.json
│   ├── jsonc/
│   │   ├── valid.jsonc
│   │   └── comments-error.jsonc
│   ├── markdown/
│   │   ├── valid.md
│   │   └── fenced-code-lang.md
│   ├── yaml/
│   │   ├── valid.yaml
│   │   └── duplicate-keys.yaml
│   ├── toml/
│   │   ├── valid.toml
│   │   └── invalid-key.toml
│   ├── html/
│   │   ├── valid.html
│   │   └── missing-alt.html
│   └── css/
│       ├── valid.css
│       └── unknown-property.css
├── unit/                        # Unit tests (against src/)
│   ├── args.test.ts             # parseArgs flag parsing
│   ├── config-factory.test.ts   # createConfig with overrides
│   ├── init.test.ts             # runInit file generation
│   └── presets/                 # Per-preset config validation
│       ├── javascript.test.ts
│       ├── typescript.test.ts
│       └── ...
├── integration/                 # Integration tests (against dist/)
│   ├── lint-file-types.test.ts  # Each file type produces expected errors
│   ├── lint-flags.test.ts       # --fix, --cache, --quiet, etc.
│   └── init-command.test.ts     # --init and --force behavior
└── helpers/                     # Shared test utilities
    ├── temp-dir.ts              # Create/cleanup temp directories
    ├── run-cli.ts               # Spawn CLI and capture output
    └── fixture-manifest.ts      # Central fixture registry
```

### Test Runner

Bun's built-in `bun:test` (no additional dependencies).

### Two Test Modes

| Mode        | Command                      | Target                     | Build Required? |
| ----------- | ---------------------------- | -------------------------- | --------------- |
| Unit        | `bun test tests/unit`        | `src/` imports             | No              |
| Integration | `bun test tests/integration` | `dist/index.js` subprocess | Yes             |

## Fixture Strategy

Each file type gets 3--4 fixture files covering different rule categories:

| File Type    | Fixture Files                                                 | Rules Tested                                           |
| ------------ | ------------------------------------------------------------- | ------------------------------------------------------ |
| **JS**       | `valid.js`, `unused-vars.js`, `console-usage.js`, `eqeqeq.js` | `no-unused-vars`, `no-console`, `eqeqeq`               |
| **TS**       | `valid.ts`, `explicit-any.ts`, `unused-params.ts`             | `@typescript-eslint/no-explicit-any`, `no-unused-vars` |
| **Astro**    | `valid.astro`, `unclosed-tag.astro`                           | Astro parser + HTML rules                              |
| **JSON**     | `valid.json`, `trailing-comma.json`                           | `@eslint/json` syntax                                  |
| **JSONC**    | `valid.jsonc`, `comments-error.jsonc`                         | JSONC parsing, syntax                                  |
| **Markdown** | `valid.md`, `fenced-code-lang.md`                             | `@eslint/markdown` rules                               |
| **YAML**     | `valid.yaml`, `duplicate-keys.yaml`                           | `eslint-plugin-yml`                                    |
| **TOML**     | `valid.toml`, `invalid-key.toml`                              | `eslint-plugin-toml`                                   |
| **HTML**     | `valid.html`, `missing-alt.html`                              | `@html-eslint` accessibility                           |
| **CSS**      | `valid.css`, `unknown-property.css`                           | `@eslint/css`                                          |

### Fixture Conventions

- Each fixture file has a header comment describing expected behavior
- `valid.*` files produce **zero** errors/warnings
- `*.js`/`*.ts` fixtures use ESM imports to match the config's
  `module: "Preserve"` setting
- Astro fixtures include frontmatter + component markup
- Markdown fixtures include fenced code blocks with and without language tags

### Temp Directory Workflow

Each test gets a fresh temp directory. Fixtures are copied there before the CLI
runs. After the test, the directory is recursively removed.

```ts
const tmpDir = mkdtempSync(join(tmpdir(), "linter-test-"));
copyFixture("javascript/unused-vars.js", tmpDir);
const { exitCode, output } = await runCli(["--no-ignore", tmpDir]);
expect(exitCode).toBe(1);
expect(output).toContain("no-unused-vars");
```

## Test Categories

### Unit Tests (`tests/unit/`)

| Test File                | What It Tests                                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args.test.ts`           | All flag parsing: `--fix`, `--cache`, `--quiet`, `--no-ignore`, `--debug`, `--version`, `--help`, `--cache-location`, `--format`, `--max-warnings`, positional args, unknown flags throw `ParseError`, `--` separator |
| `config-factory.test.ts` | `createConfig()` returns array, custom `ignores` merged, `overrides` modify rules by preset name, extra `configs` appended                                                                                            |
| `init.test.ts`           | `runInit()` creates `eslint.config.mjs`, `.config/linter.yaml`, `.vscode/settings.json`; `--force` overwrites; skips existing without force; preserves JSONC comments in settings                                     |
| `presets/*.test.ts`      | Each preset exports valid ESLint config objects with correct `name`, `files`, `plugins`, `rules`                                                                                                                      |

### Integration Tests (`tests/integration/`)

| Test File                 | What It Tests                                                                                                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lint-file-types.test.ts` | For each file type: valid fixtures exit 0, invalid fixtures exit 1 with expected rule in output                                                                                                                                   |
| `lint-flags.test.ts`      | `--fix` modifies files, `--cache` creates `.eslintcache`, `--quiet` suppresses warnings, `--no-ignore` processes ignored files, `--format json` outputs JSON, `--max-warnings` fails on threshold, `--cache-location` custom path |
| `init-command.test.ts`    | `--init` creates files in temp dir, `--init --force` overwrites, idempotent-ish (re-running skips without `--force`)                                                                                                              |

### Assertion Strategy

- **Exit codes:** Primary assertion for CLI behavior (`0` = success, `1` =
  errors/failure)
- **Output content:** Check that specific rule names appear in text output or
  JSON results
- **File system state:** For `--fix` and `--init`, assert files exist and
  contain expected content
- **Error counts:** Where applicable, assert exact `errorCount` / `warningCount`
  from JSON formatter

## Test Utilities

### `tests/helpers/temp-dir.ts`

```ts
export function createTempDir(prefix = "linter-test-"): string;
export function copyFixture(fixturePath: string, destDir: string): string;
export function cleanupTempDir(dir: string): void;
```

Uses `os.tmpdir()` + `fs.mkdtempSync()`. Cleans up via `afterEach`.

### `tests/helpers/run-cli.ts`

```ts
export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export async function runCli(args: string[], cwd?: string): Promise<CliResult>;
export async function runCliJson(
  args: string[],
  cwd?: string,
): Promise<ESLint.LintResult[]>;
```

Spawns `bun dist/index.js`, captures stdout/stderr. `runCliJson()` adds
`--format json` and parses the output.

### `tests/helpers/run-unit.ts`

```ts
export async function runLintInternal(args: CliArgs): Promise<number>;
```

Directly imports `runLint()` from `src/cli/commands/lint.ts` for fast unit
testing without subprocess overhead.

### `tests/helpers/fixture-manifest.ts`

Central registry of all fixture paths so tests don't hardcode strings:

```ts
export const FIXTURES = {
  javascript: {
    valid: "javascript/valid.js",
    unusedVars: "javascript/unused-vars.js",
    // ...
  },
  // ...
} as const;
```

### Test Lifecycle Pattern

```ts
describe("lint --fix", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("fixes auto-fixable issues", async () => {
    copyFixture("javascript/eqeqeq.js", tmpDir);
    const result = await runCli(["--fix", tmpDir]);
    expect(result.exitCode).toBe(0);
  });
});
```

## Execution

### npm Scripts (add to `package.json`)

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "prepublishOnly": "bun run build",
    "test": "bun test tests/unit",
    "test:integration": "bun run build && bun test tests/integration",
    "test:all": "bun run build && bun test"
  }
}
```

### Mise Tasks (zsh scripts)

`.config/mise/tasks/p/test`

```zsh
#!/usr/bin/env zsh
#MISE description="Run integration tests (builds first)"
source "${SCRIPT_DIR}/../_helpers"

print_header "Building project..."
bun run build || exit 1

print_header "Running integration tests..."
bun test tests/integration
```

`.config/mise/tasks/p/test-unit`

```zsh
#!/usr/bin/env zsh
#MISE description="Run unit tests"
source "${SCRIPT_DIR}/../_helpers"

print_header "Running unit tests..."
bun test tests/unit
```

### Existing Pipeline Integration

The `p:publish` dependency chain already runs `p:build` → `p:test` → `p:preview`
→ `p:publish`. The `p:test` task will now run integration tests, ensuring the
CLI is validated before every publish.

### Running Tests

```bash
# Unit tests only (fast)
mise run p:test-unit

# Integration tests (builds first)
mise run p:test

# All tests via npm
bun run test:all
```

## Dependencies

No new runtime dependencies. The test setup uses:

- `bun:test` (built into Bun)
- `node:fs`, `node:os`, `node:path`, `node:child_process` (Node.js built-ins)

## Risks & Mitigations

| Risk                                        | Mitigation                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Tests become slow                           | Unit tests run independently and don't require build. Integration tests run only in publish pipeline or on demand. |
| Plugin updates change rule behavior         | Tests assert rule names, not exact message text. Violation presence is the assertion, not message wording.         |
| Temp dir leaks                              | `afterEach` always cleans up. Tests use `try/finally` as a fallback.                                               |
| Build output stale during integration tests | `test:integration` script always runs `bun run build` first.                                                       |
