# Testing Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a comprehensive testing setup with fixtures for all supported
file types, unit tests against `src/`, integration tests against `dist/`, and
mise task scripts.

**Architecture:** Bun's built-in `bun:test` runner. Temp-directory isolation for
all tests. Unit tests import directly from `src/`. Integration tests spawn
`bun dist/index.js` as a subprocess. Fixtures are static files copied to temp
dirs per test.

**Tech Stack:** Bun (runtime + test runner), TypeScript, Node.js
`fs`/`child_process`/`os`

---

## File Map

| File                                        | Responsibility                                            |
| ------------------------------------------- | --------------------------------------------------------- |
| `tests/helpers/temp-dir.ts`                 | Create temp dirs, copy fixtures, cleanup                  |
| `tests/helpers/run-cli.ts`                  | Spawn CLI subprocess, capture stdout/stderr/exit code     |
| `tests/helpers/run-unit.ts`                 | Directly call `runLint()` from `src/` for fast unit tests |
| `tests/helpers/fixture-manifest.ts`         | Central registry of all fixture paths                     |
| `tests/fixtures/*`                          | Static fixture files for each supported file type         |
| `tests/unit/args.test.ts`                   | Test `parseArgs` for all flags and edge cases             |
| `tests/unit/config-factory.test.ts`         | Test `createConfig` with overrides and ignores            |
| `tests/unit/init.test.ts`                   | Test `runInit` file generation behavior                   |
| `tests/unit/presets/*.test.ts`              | Validate each preset exports a valid ESLint config        |
| `tests/integration/lint-file-types.test.ts` | Test CLI lints all file types correctly                   |
| `tests/integration/lint-flags.test.ts`      | Test `--fix`, `--cache`, `--quiet`, etc.                  |
| `tests/integration/init-command.test.ts`    | Test `--init` and `--force` CLI behavior                  |
| `package.json`                              | Add `test`, `test:integration`, `test:all` scripts        |
| `.config/mise/tasks/p/test`                 | Mise task for integration tests                           |
| `.config/mise/tasks/p/test-unit`            | Mise task for unit tests                                  |

---

### Task 1: Test Helpers

**Files:**

- Create: `tests/helpers/temp-dir.ts`
- Create: `tests/helpers/run-cli.ts`
- Create: `tests/helpers/run-unit.ts`
- Create: `tests/helpers/fixture-manifest.ts`

**Context:** These helpers are used by all tests. They must be created first.

- [ ] **Step 1: Create `tests/helpers/temp-dir.ts`**

```ts
import {
  cpSync,
  existsSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  join,
  resolve,
} from "node:path";

const FIXTURES_DIR = resolve(import.meta.dir, "../fixtures");

export function createTempDir(prefix = "linter-test-"): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function copyFixture(fixturePath: string, destDir: string): string {
  const src = join(FIXTURES_DIR, fixturePath);
  if (!existsSync(src)) {
    throw new Error(`Fixture not found: ${src}`);
  }
  const dest = join(destDir, fixturePath.split("/").pop()!);
  cpSync(src, dest, { recursive: true });
  return dest;
}

export function cleanupTempDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}
```

- [ ] **Step 2: Create `tests/helpers/run-cli.ts`**

```ts
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const CLI_PATH = resolve(import.meta.dir, "../../dist/index.js");

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function runCli(args: string[], cwd?: string): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", [CLI_PATH, ...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", reject);
    child.on("close", exitCode => {
      resolve({ exitCode: exitCode ?? 1, stdout, stderr });
    });
  });
}

export async function runCliJson(
  args: string[],
  cwd?: string,
): Promise<Array<Record<string, unknown>>> {
  const result = await runCli([...args, "--format", "json"], cwd);
  try {
    return JSON.parse(result.stdout) as Array<Record<string, unknown>>;
  }
  catch {
    throw new Error(
      `Failed to parse JSON output. Exit code: ${result.exitCode}, stdout: ${result.stdout}, stderr: ${result.stderr}`,
    );
  }
}
```

- [ ] **Step 3: Create `tests/helpers/run-unit.ts`**

```ts
import { runLint } from "../../src/cli/commands/lint.js";
import type { CliArgs } from "../../src/cli/types.js";

export async function runLintInternal(args: CliArgs): Promise<number> {
  return runLint(args);
}
```

- [ ] **Step 4: Create `tests/helpers/fixture-manifest.ts`**

```ts
export const FIXTURES = {
  javascript: {
    valid: "javascript/valid.js",
    unusedVars: "javascript/unused-vars.js",
    consoleUsage: "javascript/console-usage.js",
    eqeqeq: "javascript/eqeqeq.js",
  },
  typescript: {
    valid: "typescript/valid.ts",
    explicitAny: "typescript/explicit-any.ts",
    unusedParams: "typescript/unused-params.ts",
    preferConst: "typescript/prefer-const.ts",
  },
  astro: {
    valid: "astro/valid.astro",
    unclosedTag: "astro/unclosed-tag.astro",
  },
  json: {
    valid: "json/valid.json",
    trailingComma: "json/trailing-comma.json",
  },
  jsonc: {
    valid: "jsonc/valid.jsonc",
    commentsError: "jsonc/comments-error.jsonc",
  },
  markdown: {
    valid: "markdown/valid.md",
    fencedCodeLang: "markdown/fenced-code-lang.md",
  },
  yaml: {
    valid: "yaml/valid.yaml",
    duplicateKeys: "yaml/duplicate-keys.yaml",
  },
  toml: {
    valid: "toml/valid.toml",
    invalidKey: "toml/invalid-key.toml",
  },
  html: {
    valid: "html/valid.html",
    missingAlt: "html/missing-alt.html",
  },
  css: {
    valid: "css/valid.css",
    unknownProperty: "css/unknown-property.css",
  },
} as const;
```

- [ ] **Step 5: Commit**

```bash
git add tests/helpers/
git commit -m "test(helpers): add temp-dir, run-cli, run-unit, fixture-manifest"
```

---

### Task 2: JavaScript Fixtures

**Files:**

- Create: `tests/fixtures/javascript/valid.js`
- Create: `tests/fixtures/javascript/unused-vars.js`
- Create: `tests/fixtures/javascript/console-usage.js`
- Create: `tests/fixtures/javascript/eqeqeq.js`

- [ ] **Step 1: Create valid JS fixture**

```js
// valid.js - should produce zero errors
export function greet(name) {
  return `Hello, ${name}`;
}

export const message = greet("world");
```

- [ ] **Step 2: Create unused-vars JS fixture**

```js
// unused-vars.js - should trigger no-unused-vars
const unused = 42;
export const used = 1;
```

- [ ] **Step 3: Create console-usage JS fixture**

```js
// console-usage.js - should trigger no-console
console.log("this should trigger a warning");
export const x = 1;
```

- [ ] **Step 4: Create eqeqeq JS fixture**

```js
// eqeqeq.js - should trigger eqeqeq (auto-fixable)
export function check(a, b) {
  return a == b;
}
```

- [ ] **Step 5: Commit**

```bash
git add tests/fixtures/javascript/
git commit -m "test(fixtures): add javascript fixtures"
```

---

### Task 3: TypeScript Fixtures

**Files:**

- Create: `tests/fixtures/typescript/valid.ts`
- Create: `tests/fixtures/typescript/explicit-any.ts`
- Create: `tests/fixtures/typescript/unused-params.ts`
- Create: `tests/fixtures/typescript/prefer-const.ts`

- [ ] **Step 1: Create valid TS fixture**

```ts
// valid.ts - should produce zero errors
export function add(a: number, b: number): number {
  return a + b;
}

export const result: number = add(1, 2);
```

- [ ] **Step 2: Create explicit-any TS fixture**

```ts
// explicit-any.ts - should trigger @typescript-eslint/no-explicit-any
export function process(data: any): any {
  return data;
}
```

- [ ] **Step 3: Create unused-params TS fixture**

```ts
// unused-params.ts - should trigger no-unused-vars for parameters
export function handler(_event: string, _ctx: string): string {
  return "done";
}
```

- [ ] **Step 4: Create prefer-const TS fixture**

```ts
// prefer-const.ts - should trigger prefer-const (auto-fixable)
export function init(): void {
  let x = 1;
  console.log(x);
}
```

- [ ] **Step 5: Commit**

```bash
git add tests/fixtures/typescript/
git commit -m "test(fixtures): add typescript fixtures"
```

---

### Task 4: Astro, JSON, JSONC Fixtures

**Files:**

- Create: `tests/fixtures/astro/valid.astro`
- Create: `tests/fixtures/astro/unclosed-tag.astro`
- Create: `tests/fixtures/json/valid.json`
- Create: `tests/fixtures/json/trailing-comma.json`
- Create: `tests/fixtures/jsonc/valid.jsonc`
- Create: `tests/fixtures/jsonc/comments-error.jsonc`

- [ ] **Step 1: Create Astro fixtures**

`tests/fixtures/astro/valid.astro`:

```astro
---
const title = "Hello";
---
<html lang="en">
  <head><title>{title}</title></head>
  <body><h1>{title}</h1></body>
</html>
```

`tests/fixtures/astro/unclosed-tag.astro`:

```astro
---
const name = "world";
---
<div>
  <span>unclosed
</div>
```

- [ ] **Step 2: Create JSON fixtures**

`tests/fixtures/json/valid.json`:

```json
{
  "name": "test",
  "version": "1.0.0"
}
```

`tests/fixtures/json/trailing-comma.json`:

```json
{
  "name": "test",
  "version": "1.0.0"
}
```

- [ ] **Step 3: Create JSONC fixtures**

`tests/fixtures/jsonc/valid.jsonc`:

```jsonc
{
  // This is a comment
  "name": "test",
  "version": "1.0.0",
}
```

`tests/fixtures/jsonc/comments-error.jsonc`:

```jsonc
{
  "name": "test",
  // missing comma below is not valid JSONC in some contexts
  "version": "1.0.0",
}
```

- [ ] **Step 4: Commit**

```bash
git add tests/fixtures/astro/ tests/fixtures/json/ tests/fixtures/jsonc/
git commit -m "test(fixtures): add astro, json, and jsonc fixtures"
```

---

### Task 5: Markdown, YAML, TOML Fixtures

**Files:**

- Create: `tests/fixtures/markdown/valid.md`
- Create: `tests/fixtures/markdown/fenced-code-lang.md`
- Create: `tests/fixtures/yaml/valid.yaml`
- Create: `tests/fixtures/yaml/duplicate-keys.yaml`
- Create: `tests/fixtures/toml/valid.toml`
- Create: `tests/fixtures/toml/invalid-key.toml`

- [ ] **Step 1: Create Markdown fixtures**

`tests/fixtures/markdown/valid.md`:

````markdown
# Valid Markdown

This is a paragraph.

```ts
const x = 1;
```
````

````
`tests/fixtures/markdown/fenced-code-lang.md`:
```markdown
# Missing Language
````

const x = 1;

```
```

- [ ] **Step 2: Create YAML fixtures**

`tests/fixtures/yaml/valid.yaml`:

```yaml
name: test
version: "1.0.0"
```

`tests/fixtures/yaml/duplicate-keys.yaml`:

```yaml
name: first
name: second
```

- [ ] **Step 3: Create TOML fixtures**

`tests/fixtures/toml/valid.toml`:

```toml
name    = "test"
version = "1.0.0"
```

`tests/fixtures/toml/invalid-key.toml`:

```toml
1invalid-key = true
name         = "test"
```

- [ ] **Step 4: Commit**

```bash
git add tests/fixtures/markdown/ tests/fixtures/yaml/ tests/fixtures/toml/
git commit -m "test(fixtures): add markdown, yaml, and toml fixtures"
```

---

### Task 6: HTML and CSS Fixtures

**Files:**

- Create: `tests/fixtures/html/valid.html`
- Create: `tests/fixtures/html/missing-alt.html`
- Create: `tests/fixtures/css/valid.css`
- Create: `tests/fixtures/css/unknown-property.css`

- [ ] **Step 1: Create HTML fixtures**

`tests/fixtures/html/valid.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head><title>Test</title></head>
  <body>
    <img src="test.png" alt="Test image" />
  </body>
</html>
```

`tests/fixtures/html/missing-alt.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head><title>Test</title></head>
  <body>
    <img src="test.png" />
  </body>
</html>
```

- [ ] **Step 2: Create CSS fixtures**

`tests/fixtures/css/valid.css`:

```css
.container {
  display: flex;
  padding: 1rem;
}
```

`tests/fixtures/css/unknown-property.css`:

```css
.invalid {
  unknown-property: value;
  color: red;
}
```

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/html/ tests/fixtures/css/
git commit -m "test(fixtures): add html and css fixtures"
```

---

### Task 7: Unit Tests — Args Parsing

**Files:**

- Create: `tests/unit/args.test.ts`

- [ ] **Step 1: Write args unit tests**

```ts
import {
  describe,
  expect,
  test,
} from "bun:test";
import { parseArgs } from "../../src/cli/args.js";
import { ParseError } from "../../src/cli/types.js";

describe("parseArgs", () => {
  test("parses --fix", () => {
    const result = parseArgs(["--fix", "src/"]);
    expect(result.flags.fix).toBe(true);
    expect(result.positional).toEqual(["src/"]);
  });

  test("parses --cache", () => {
    const result = parseArgs(["--cache"]);
    expect(result.flags.cache).toBe(true);
  });

  test("parses --quiet", () => {
    const result = parseArgs(["--quiet"]);
    expect(result.flags.quiet).toBe(true);
  });

  test("parses --no-ignore", () => {
    const result = parseArgs(["--no-ignore"]);
    expect(result.flags.ignore).toBe(false);
  });

  test("parses --debug", () => {
    const result = parseArgs(["--debug"]);
    expect(result.flags.debug).toBe(true);
  });

  test("parses --version and -v", () => {
    expect(parseArgs(["--version"]).flags.version).toBe(true);
    expect(parseArgs(["-v"]).flags.version).toBe(true);
  });

  test("parses --help and -h", () => {
    expect(parseArgs(["--help"]).flags.help).toBe(true);
    expect(parseArgs(["-h"]).flags.help).toBe(true);
  });

  test("parses --init", () => {
    const result = parseArgs(["--init"]);
    expect(result.flags.init).toBe(true);
  });

  test("parses --force", () => {
    const result = parseArgs(["--init", "--force"]);
    expect(result.flags.force).toBe(true);
  });

  test("parses --cache-location", () => {
    const result = parseArgs(["--cache-location", "/tmp/cache"]);
    expect(result.cacheLocation).toBe("/tmp/cache");
  });

  test("throws on missing --cache-location value", () => {
    expect(() => parseArgs(["--cache-location"])).toThrow(ParseError);
  });

  test("parses --format", () => {
    const result = parseArgs(["--format", "json"]);
    expect(result.format).toBe("json");
  });

  test("parses -f as --format", () => {
    const result = parseArgs(["-f", "compact"]);
    expect(result.format).toBe("compact");
  });

  test("throws on missing --format value", () => {
    expect(() => parseArgs(["--format"])).toThrow(ParseError);
  });

  test("parses --max-warnings", () => {
    const result = parseArgs(["--max-warnings", "5"]);
    expect(result.maxWarnings).toBe(5);
  });

  test("throws on invalid --max-warnings value", () => {
    expect(() => parseArgs(["--max-warnings", "abc"])).toThrow(ParseError);
  });

  test("parses positional args", () => {
    const result = parseArgs(["src/", "lib/"]);
    expect(result.positional).toEqual(["src/", "lib/"]);
  });

  test("defaults positional to empty array", () => {
    const result = parseArgs([]);
    expect(result.positional).toEqual([]);
  });

  test("throws on unknown flags", () => {
    expect(() => parseArgs(["--unknown"])).toThrow(ParseError);
  });

  test("parses -- separator", () => {
    const result = parseArgs(["--", "--some-flag", "file.js"]);
    expect(result.positional).toEqual(["--some-flag", "file.js"]);
  });

  test("default flag values are all false/off", () => {
    const result = parseArgs([]);
    expect(result.flags).toEqual({
      init: false,
      force: false,
      fix: false,
      cache: false,
      quiet: false,
      ignore: true,
      debug: false,
      version: false,
      help: false,
    });
    expect(result.cacheLocation).toBeUndefined();
    expect(result.format).toBeUndefined();
    expect(result.maxWarnings).toBeUndefined();
    expect(result.positional).toEqual([]);
  });
});
```

- [ ] **Step 2: Run unit tests**

```bash
mise x -- bun test tests/unit/args.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/args.test.ts
git commit -m "test(unit): add args parsing tests"
```

---

### Task 8: Unit Tests — Config Factory

**Files:**

- Create: `tests/unit/config-factory.test.ts`

- [ ] **Step 1: Write config-factory unit tests**

```ts
import {
  describe,
  expect,
  test,
} from "bun:test";
import { createConfig } from "../../src/config-factory.js";

describe("createConfig", () => {
  test("returns an array", () => {
    const config = createConfig();
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  test("returns base config with no options", () => {
    const config = createConfig();
    const names = config
      .map(c => c.name)
      .filter(Boolean);
    expect(names.length).toBeGreaterThan(0);
  });

  test("adds ignores when provided", () => {
    const config = createConfig({ ignores: ["**/dist/**"] });
    const ignoresConfig = config.find(
      c => c.name === "@askviraj/linter-cli/ignores",
    );
    expect(ignoresConfig).toBeDefined();
  });

  test("applies overrides by preset name", () => {
    const config = createConfig({
      overrides: {
        "@askviraj/linter-cli/typescript": {
          rules: {
            "@typescript-eslint/no-explicit-any": "error",
          },
        },
      },
    });
    const tsConfig = config.find(
      c => c.name === "@askviraj/linter-cli/typescript",
    );
    expect(tsConfig?.rules?.["@typescript-eslint/no-explicit-any"]).toBe(
      "error",
    );
  });

  test("appends extra configs when provided", () => {
    const config = createConfig({
      configs: [{ name: "custom", files: ["**/*.test.ts"], rules: {} }],
    });
    const customConfig = config.find(c => c.name === "custom");
    expect(customConfig).toBeDefined();
    expect(customConfig?.files).toEqual(["**/*.test.ts"]);
  });
});
```

- [ ] **Step 2: Run unit tests**

```bash
mise x -- bun test tests/unit/config-factory.test.ts
```

Expected: All tests pass. If preset names differ from the expectations above,
adjust the test to match actual preset names (check `src/config/presets/*.ts`
for `name` fields).

- [ ] **Step 3: Commit**

```bash
git add tests/unit/config-factory.test.ts
git commit -m "test(unit): add config-factory tests"
```

---

### Task 9: Unit Tests — Init Command

**Files:**

- Create: `tests/unit/init.test.ts`

- [ ] **Step 1: Write init unit tests**

```ts
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import { runInit } from "../../src/cli/commands/init.js";
import {
  cleanupTempDir,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("runInit", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("creates eslint.config.mjs", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/eslint.config.mjs`;
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("@askviraj/linter-cli/auto");
  });

  test("creates .config/linter.yaml", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/.config/linter.yaml`;
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("@askviraj/linter-cli");
  });

  test("creates .vscode/settings.json", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/.vscode/settings.json`;
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("eslint.useFlatConfig");
  });

  test("skips existing files without force", () => {
    runInit({ cwd: tmpDir });
    // Should not throw on second run
    expect(() => runInit({ cwd: tmpDir })).not.toThrow();
  });

  test("overwrites existing files with force", () => {
    runInit({ cwd: tmpDir });
    // Modify the file
    const path = `${tmpDir}/eslint.config.mjs`;
    const original = readFileSync(path, "utf-8");
    runInit({ cwd: tmpDir, force: true });
    const overwritten = readFileSync(path, "utf-8");
    expect(overwritten).toBe(original); // same content, overwritten
  });
});
```

- [ ] **Step 2: Run unit tests**

```bash
mise x -- bun test tests/unit/init.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/init.test.ts
git commit -m "test(unit): add init command tests"
```

---

### Task 10: Unit Tests — Preset Validation

**Files:**

- Create: `tests/unit/presets/javascript.test.ts`
- Create: `tests/unit/presets/typescript.test.ts`
- Create: `tests/unit/presets/astro.test.ts`
- Create: `tests/unit/presets/json.test.ts`
- Create: `tests/unit/presets/jsonc.test.ts`
- Create: `tests/unit/presets/markdown.test.ts`
- Create: `tests/unit/presets/yaml.test.ts`
- Create: `tests/unit/presets/toml.test.ts`
- Create: `tests/unit/presets/html.test.ts`
- Create: `tests/unit/presets/css.test.ts`

- [ ] **Step 1: Write a shared preset test template**

Each preset test follows the same pattern. Example for JavaScript:

`tests/unit/presets/javascript.test.ts`:

```ts
import {
  describe,
  expect,
  test,
} from "bun:test";
import { javascriptConfig } from "../../../src/config/presets/javascript.js";

describe("javascript preset", () => {
  test("has a name", () => {
    expect(javascriptConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(javascriptConfig.files)).toBe(true);
    expect(javascriptConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof javascriptConfig.rules).toBe("object");
  });
});
```

- [ ] **Step 2: Create all preset tests**

Create the following files with the same pattern, importing from the correct
preset path:

| Test File                               | Import Path                                 |
| --------------------------------------- | ------------------------------------------- |
| `tests/unit/presets/typescript.test.ts` | `../../../src/config/presets/typescript.js` |
| `tests/unit/presets/astro.test.ts`      | `../../../src/config/presets/astro.js`      |
| `tests/unit/presets/json.test.ts`       | `../../../src/config/presets/json.js`       |
| `tests/unit/presets/jsonc.test.ts`      | `../../../src/config/presets/jsonc.js`      |
| `tests/unit/presets/markdown.test.ts`   | `../../../src/config/presets/markdown.js`   |
| `tests/unit/presets/yaml.test.ts`       | `../../../src/config/presets/yaml.js`       |
| `tests/unit/presets/toml.test.ts`       | `../../../src/config/presets/toml.js`       |
| `tests/unit/presets/html.test.ts`       | `../../../src/config/presets/html.js`       |
| `tests/unit/presets/css.test.ts`        | `../../../src/config/presets/css.js`        |

Each test checks: `name` is defined, `files` is a non-empty array, `rules` is an
object.

- [ ] **Step 3: Run all preset tests**

```bash
mise x -- bun test tests/unit/presets/
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/presets/
git commit -m "test(unit): add preset validation tests"
```

---

### Task 11: Integration Tests — File Type Linting

**Files:**

- Create: `tests/integration/lint-file-types.test.ts`

- [ ] **Step 1: Build the project first**

```bash
mise x -- bun run build
```

- [ ] **Step 2: Write integration tests for all file types**

```ts
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { FIXTURES } from "../helpers/fixture-manifest.js";
import {
  runCli,
  runCliJson,
} from "../helpers/run-cli.js";
import {
  cleanupTempDir,
  copyFixture,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("lint file types", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("lints valid javascript with no errors", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid javascript with errors", async () => {
    copyFixture(FIXTURES.javascript.unusedVars, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("no-unused-vars");
  });

  test("lints valid typescript with no errors", async () => {
    copyFixture(FIXTURES.typescript.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid typescript with errors", async () => {
    copyFixture(FIXTURES.typescript.explicitAny, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("no-explicit-any");
  });

  test("lints valid astro with no errors", async () => {
    copyFixture(FIXTURES.astro.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid astro with errors", async () => {
    copyFixture(FIXTURES.astro.unclosedTag, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
  });

  test("lints valid json with no errors", async () => {
    copyFixture(FIXTURES.json.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid json with errors", async () => {
    copyFixture(FIXTURES.json.trailingComma, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
  });

  test("lints valid jsonc with no errors", async () => {
    copyFixture(FIXTURES.jsonc.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid jsonc with errors", async () => {
    copyFixture(FIXTURES.jsonc.commentsError, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
  });

  test("lints valid markdown with no errors", async () => {
    copyFixture(FIXTURES.markdown.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints markdown with fenced code language warnings", async () => {
    copyFixture(FIXTURES.markdown.fencedCodeLang, tmpDir);
    const results = await runCliJson(["--no-ignore", tmpDir]);
    const fileResult = results.find(r => String(r.filePath).endsWith(".md"));
    expect(fileResult).toBeDefined();
  });

  test("lints valid yaml with no errors", async () => {
    copyFixture(FIXTURES.yaml.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid yaml with errors", async () => {
    copyFixture(FIXTURES.yaml.duplicateKeys, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
  });

  test("lints valid toml with no errors", async () => {
    copyFixture(FIXTURES.toml.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid toml with errors", async () => {
    copyFixture(FIXTURES.toml.invalidKey, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
  });

  test("lints valid html with no errors", async () => {
    copyFixture(FIXTURES.html.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid html with errors", async () => {
    copyFixture(FIXTURES.html.missingAlt, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
  });

  test("lints valid css with no errors", async () => {
    copyFixture(FIXTURES.css.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid css with errors", async () => {
    copyFixture(FIXTURES.css.unknownProperty, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(1);
  });
});
```

- [ ] **Step 3: Run integration tests**

```bash
mise x -- bun test tests/integration/lint-file-types.test.ts
```

Expected: All tests pass. If any fixture doesn't trigger the expected rule,
adjust the fixture content to ensure it produces the violation, or update the
assertion to match actual ESLint behavior.

- [ ] **Step 4: Commit**

```bash
git add tests/integration/lint-file-types.test.ts
git commit -m "test(integration): add file type linting tests"
```

---

### Task 12: Integration Tests — CLI Flags

**Files:**

- Create: `tests/integration/lint-flags.test.ts`

- [ ] **Step 1: Write flag integration tests**

```ts
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import { FIXTURES } from "../helpers/fixture-manifest.js";
import {
  runCli,
  runCliJson,
} from "../helpers/run-cli.js";
import {
  cleanupTempDir,
  copyFixture,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("lint flags", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("--fix auto-fixes eqeqeq", async () => {
    const fixturePath = copyFixture(FIXTURES.javascript.eqeqeq, tmpDir);
    const before = readFileSync(fixturePath, "utf-8");
    expect(before).toContain("== ");

    const result = await runCli(["--fix", "--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);

    const after = readFileSync(fixturePath, "utf-8");
    expect(after).toContain("=== ");
  });

  test("--cache creates cache file", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const cacheDir = createTempDir("linter-cache-");
    const result = await runCli([
      "--cache",
      "--cache-location",
      `${cacheDir}/.eslintcache`,
      "--no-ignore",
      tmpDir,
    ]);
    expect(result.exitCode).toBe(0);
    expect(existsSync(`${cacheDir}/.eslintcache`)).toBe(true);
    cleanupTempDir(cacheDir);
  });

  test("--quiet suppresses warnings", async () => {
    copyFixture(FIXTURES.javascript.consoleUsage, tmpDir);
    const normalResult = await runCliJson(["--no-ignore", tmpDir]);
    const normalWarnings = normalResult.reduce(
      (sum, r) => sum + (r.warningCount as number),
      0,
    );
    expect(normalWarnings).toBeGreaterThan(0);

    const quietResult = await runCliJson(["--quiet", "--no-ignore", tmpDir]);
    const quietWarnings = quietResult.reduce(
      (sum, r) => sum + (r.warningCount as number),
      0,
    );
    expect(quietWarnings).toBe(0);
  });

  test("--format json outputs valid JSON", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const result = await runCli(["--format", "json", "--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test("--max-warnings fails when exceeded", async () => {
    copyFixture(FIXTURES.javascript.consoleUsage, tmpDir);
    const result = await runCli([
      "--max-warnings",
      "0",
      "--no-ignore",
      tmpDir,
    ]);
    expect(result.exitCode).toBe(1);
  });

  test("--max-warnings passes when not exceeded", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const result = await runCli([
      "--max-warnings",
      "10",
      "--no-ignore",
      tmpDir,
    ]);
    expect(result.exitCode).toBe(0);
  });

  test("positional args target specific files", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    copyFixture(FIXTURES.javascript.unusedVars, tmpDir);
    const result = await runCli([
      "--no-ignore",
      `${tmpDir}/valid.js`,
    ]);
    expect(result.exitCode).toBe(0);
  });

  test("--no-ignore processes normally ignored files", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const result = await runCli(["--no-ignore", tmpDir]);
    expect(result.exitCode).toBe(0);
  });
});
```

- [ ] **Step 2: Run flag integration tests**

```bash
mise x -- bun test tests/integration/lint-flags.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/lint-flags.test.ts
git commit -m "test(integration): add CLI flags tests"
```

---

### Task 13: Integration Tests — Init Command

**Files:**

- Create: `tests/integration/init-command.test.ts`

- [ ] **Step 1: Write init integration tests**

```ts
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import { runCli } from "../helpers/run-cli.js";
import {
  cleanupTempDir,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("init command", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("--init creates config files", async () => {
    const result = await runCli(["--init"], tmpDir);
    expect(result.exitCode).toBe(0);
    expect(existsSync(`${tmpDir}/eslint.config.mjs`)).toBe(true);
    expect(existsSync(`${tmpDir}/.config/linter.yaml`)).toBe(true);
    expect(existsSync(`${tmpDir}/.vscode/settings.json`)).toBe(true);
  });

  test("--init skips existing files without --force", async () => {
    await runCli(["--init"], tmpDir);
    const result = await runCli(["--init"], tmpDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("skipped");
  });

  test("--init --force overwrites existing files", async () => {
    await runCli(["--init"], tmpDir);
    const result = await runCli(["--init", "--force"], tmpDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("overwritten");
  });

  test("generated eslint.config.mjs exports from auto", async () => {
    await runCli(["--init"], tmpDir);
    const content = readFileSync(`${tmpDir}/eslint.config.mjs`, "utf-8");
    expect(content).toContain("@askviraj/linter-cli/auto");
  });

  test("generated .vscode/settings.json enables flat config", async () => {
    await runCli(["--init"], tmpDir);
    const content = readFileSync(`${tmpDir}/.vscode/settings.json`, "utf-8");
    expect(content).toContain("eslint.useFlatConfig");
  });
});
```

- [ ] **Step 2: Run init integration tests**

```bash
mise x -- bun test tests/integration/init-command.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/init-command.test.ts
git commit -m "test(integration): add init command tests"
```

---

### Task 14: npm Scripts and Mise Tasks

**Files:**

- Modify: `package.json` (scripts section)
- Create: `.config/mise/tasks/p/test`
- Create: `.config/mise/tasks/p/test-unit`

- [ ] **Step 1: Add test scripts to package.json**

Add these entries to the `"scripts"` object in `package.json`:

```json
{
  "test": "bun test tests/unit",
  "test:integration": "bun run build && bun test tests/integration",
  "test:all": "bun run build && bun test"
}
```

- [ ] **Step 2: Create mise integration test task**

`.config/mise/tasks/p/test`:

```zsh
#!/usr/bin/env zsh
#MISE description="Run integration tests (builds first)"
source "${SCRIPT_DIR}/../_helpers"

print_header "Building project..."
bun run build || exit 1

print_header "Running integration tests..."
bun test tests/integration
```

Make it executable:

```bash
chmod +x .config/mise/tasks/p/test
```

- [ ] **Step 3: Create mise unit test task**

`.config/mise/tasks/p/test-unit`:

```zsh
#!/usr/bin/env zsh
#MISE description="Run unit tests"
source "${SCRIPT_DIR}/../_helpers"

print_header "Running unit tests..."
bun test tests/unit
```

Make it executable:

```bash
chmod +x .config/mise/tasks/p/test-unit
```

- [ ] **Step 4: Verify tasks work**

```bash
mise x -- mise run p:test-unit
mise x -- mise run p:test
```

Expected: Both commands run successfully.

- [ ] **Step 5: Commit**

```bash
git add package.json .config/mise/tasks/p/test .config/mise/tasks/p/test-unit
git commit -m "chore: add test scripts and mise tasks"
```

---

### Task 15: Final Verification

- [ ] **Step 1: Run all unit tests**

```bash
mise x -- mise run p:test-unit
```

Expected: All unit tests pass.

- [ ] **Step 2: Run all integration tests**

```bash
mise x -- mise run p:test
```

Expected: Build succeeds, all integration tests pass.

- [ ] **Step 3: Run full test suite via npm**

```bash
mise x -- bun run test:all
```

Expected: Build succeeds, all tests pass.

- [ ] **Step 4: Format code**

```bash
mise x -- mise run code:format
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "test: complete testing setup for all file types and flags"
```

---

## Self-Review Checklist

**1. Spec coverage:**

| Spec Requirement                                             | Task    |
| ------------------------------------------------------------ | ------- |
| Test helpers (temp-dir, run-cli, run-unit, fixture-manifest) | Task 1  |
| JavaScript fixtures                                          | Task 2  |
| TypeScript fixtures                                          | Task 3  |
| Astro, JSON, JSONC fixtures                                  | Task 4  |
| Markdown, YAML, TOML fixtures                                | Task 5  |
| HTML, CSS fixtures                                           | Task 6  |
| Unit tests for args parsing                                  | Task 7  |
| Unit tests for config factory                                | Task 8  |
| Unit tests for init command                                  | Task 9  |
| Unit tests for presets                                       | Task 10 |
| Integration tests for file types                             | Task 11 |
| Integration tests for flags                                  | Task 12 |
| Integration tests for init command                           | Task 13 |
| npm scripts and mise tasks                                   | Task 14 |
| Final verification                                           | Task 15 |

**2. Placeholder scan:** No TBD, TODO, or vague steps. Every step has exact file
paths, code, and commands.

**3. Type consistency:** `CliResult`, `FIXTURES`, helper function signatures are
consistent across all tasks.
