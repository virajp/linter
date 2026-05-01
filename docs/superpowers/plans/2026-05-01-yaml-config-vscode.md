# YAML Config + VS Code Extension Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a declarative YAML config layer (`.config/linter.yaml`), a VS
Code-compatible auto-config export (`@virajp/linter/auto`), and refactor the CLI
to use ESLint's programmatic API with curated argument handling.

**Architecture:** A shared `config-loader` reads `.config/linter.yaml` and
parses it. A `config-factory` merges the YAML options with the bundled base
config. Both the CLI (`src/index.ts`) and the VS Code entry point
(`src/auto.ts`) use the same loader + factory. An `init` module scaffolds the
required files in target repos.

**Tech Stack:** TypeScript, ESLint 10 (programmatic API), `yaml` parser, Bun

---

## Task 1: Name the virtual-files config block in `eslint.config.ts`

**Files:**

- Modify: `src/eslint.config.ts:366-377`

The markdown virtual-files block (for `**/*.md/*.ts` and `**/*.md/*.tsx`) lacks
a `name`, so YAML `overrides` cannot target it.

- [ ] **Step 1: Add `name` field**

```ts
{
  // This matches the virtual files created by the markdown plugin
  name: "markdown-typescript",
  files: [
    "**/*.md/*.ts",
    "**/*.md/*.tsx",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-expressions": "off",
  },
},
```

- [ ] **Step 2: Verify no other unnamed blocks remain**

Run: `grep -n "name:" src/eslint.config.ts`

Expected: Every config object (except `globalIgnores`) has a `name`.

- [ ] **Step 3: Commit**

```bash
git add src/eslint.config.ts
git commit -m "feat: add name to markdown virtual-files config block"
```

---

## Task 2: Create `src/config-loader.ts`

**Files:**

- Create: `src/config-loader.ts`

This module finds `.config/linter.yaml` by walking up from a start directory,
parses it, validates keys, and returns typed options.

- [ ] **Step 1: Write the module**

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

export interface LinterYamlRaw {
  ignores?: string[];
  overrides?: Record<string, { rules?: Record<string, unknown>; }>;
  configs?: unknown[];
}

export function findLinterYaml(startDir: string): string | undefined {
  let dir = startDir;
  while (true) {
    const candidate = resolve(dir, ".config", "linter.yaml");
    try {
      readFileSync(candidate);
      return candidate;
    }
    catch {
      // not found
    }
    const parent = resolve(dir, "..");
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return undefined;
}

export function loadYamlOptions(startDir: string): LinterYamlRaw {
  const yamlPath = findLinterYaml(startDir);
  if (!yamlPath) {
    return {};
  }

  const content = readFileSync(yamlPath, "utf-8");
  let parsed: Record<string, unknown>;
  try {
    parsed = parse(content) as Record<string, unknown> || {};
  }
  catch (e) {
    console.error(
      `Failed to parse ${yamlPath}:`,
      e instanceof Error ? e.message : e,
    );
    process.exit(1);
  }

  const knownKeys = new Set(["ignores", "overrides", "configs"]);
  for (const key of Object.keys(parsed)) {
    if (!knownKeys.has(key)) {
      console.warn(
        `[@virajp/linter] Warning: unknown key "${key}" in .config/linter.yaml`,
      );
    }
  }

  return parsed as LinterYamlRaw;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/config-loader.ts
git commit -m "feat: add config-loader for YAML parsing"
```

---

## Task 3: Create `src/config-factory.ts`

**Files:**

- Create: `src/config-factory.ts`

Imports the base config and `config-loader`, then builds the merged ESLint
config array.

- [ ] **Step 1: Write the module**

```ts
import type { Linter } from "eslint";
import { globalIgnores } from "eslint/config";
import type { LinterYamlRaw } from "./config-loader.js";
import baseConfig from "./eslint.config.js";

export interface LinterYamlOptions extends LinterYamlRaw {}

export function createConfig(
  options: LinterYamlOptions = {},
): Linter.Config[] {
  const configs: Linter.Config[] = [];

  if (options.ignores && options.ignores.length > 0) {
    configs.push(globalIgnores(options.ignores));
  }

  for (const base of baseConfig) {
    const clone: Linter.Config = { ...base };
    if (base.name && options.overrides?.[base.name]) {
      clone.rules = { ...base.rules, ...options.overrides[base.name].rules };
    }
    configs.push(clone);
  }

  if (options.configs) {
    configs.push(...(options.configs as Linter.Config[]));
  }

  return configs;
}

export default createConfig;
```

- [ ] **Step 2: Commit**

```bash
git add src/config-factory.ts
git commit -m "feat: add createConfig factory for merging YAML overrides"
```

---

## Task 4: Create `src/auto.ts`

**Files:**

- Create: `src/auto.ts`

VS Code entry point. Loads YAML options from `process.cwd()` and exports the
built config.

- [ ] **Step 1: Write the module**

```ts
import { createConfig } from "./config-factory.js";
import { loadYamlOptions } from "./config-loader.js";

const config = createConfig(loadYamlOptions(process.cwd()));
export default config;
```

- [ ] **Step 2: Commit**

```bash
git add src/auto.ts
git commit -m "feat: add auto-config entry point for VS Code extension"
```

---

## Task 5: Create `src/init.ts`

**Files:**

- Create: `src/init.ts`

Scaffolds `eslint.config.mjs`, `.config/linter.yaml`, and
`.vscode/settings.json`.

- [ ] **Step 1: Write the module**

```ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const ESLINT_CONFIG_MJS = `// Auto-generated by @virajp/linter
// Run \`npx @virajp/linter --init\` to regenerate.
export { default } from "@virajp/linter/auto";
`;

const LINTER_YAML = `# @virajp/linter configuration
#
# Add custom ignores, rule overrides, and additional config blocks below.

# ignores:
#   - "**/generated/**"
#   - "**/*.d.ts"
#
# overrides:
#   typescript:
#     rules:
#       "@typescript-eslint/no-explicit-any": "error"
#
# configs:
#   - name: "custom"
#     files: ["**/*.ts"]
#     rules: {}
`;

const VSCODE_SETTINGS: Record<string, unknown> = {
  "eslint.useFlatConfig": true,
};

function mergeVsCodeSettings(existingPath: string): string {
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(readFileSync(existingPath, "utf-8")) as Record<
      string,
      unknown
    >;
  }
  catch {
    // file doesn't exist or is invalid
  }
  const merged = { ...existing, ...VSCODE_SETTINGS };
  return JSON.stringify(merged, null, 2) + "\n";
}

export interface InitOptions {
  force?: boolean;
  cwd?: string;
}

export function runInit(options: InitOptions = {}): void {
  const cwd = options.cwd || process.cwd();

  // 1. eslint.config.mjs
  const eslintConfigPath = resolve(cwd, "eslint.config.mjs");
  if (existsSync(eslintConfigPath) && !options.force) {
    console.error(
      `eslint.config.mjs already exists. Use --force to overwrite.`,
    );
    process.exit(1);
  }
  writeFileSync(eslintConfigPath, ESLINT_CONFIG_MJS);

  // 2. .config/linter.yaml
  const configDir = resolve(cwd, ".config");
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  const linterYamlPath = resolve(configDir, "linter.yaml");
  if (existsSync(linterYamlPath) && !options.force) {
    console.error(
      `.config/linter.yaml already exists. Use --force to overwrite.`,
    );
    process.exit(1);
  }
  writeFileSync(linterYamlPath, LINTER_YAML);

  // 3. .vscode/settings.json
  const vscodeDir = resolve(cwd, ".vscode");
  if (!existsSync(vscodeDir)) {
    mkdirSync(vscodeDir, { recursive: true });
  }
  const settingsPath = resolve(vscodeDir, "settings.json");
  writeFileSync(settingsPath, mergeVsCodeSettings(settingsPath));

  console.log("Initialized @virajp/linter:");
  console.log(`  - ${eslintConfigPath}`);
  console.log(`  - ${linterYamlPath}`);
  console.log(`  - ${settingsPath}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/init.ts
git commit -m "feat: add --init scaffolding for eslint.config.mjs and vscode settings"
```

---

## Task 6: Refactor `src/index.ts` to Programmatic API

**Files:**

- Modify: `src/index.ts`

Replace the subprocess spawn with ESLint's programmatic API. Keep the existing
version logic. Add curated arg parsing, `--init` handling, and config building.

- [ ] **Step 1: Rewrite `src/index.ts`**

```ts
#!/usr/bin/env node
import { ESLint } from "eslint";
import {
  readFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import {
  dirname,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import { createConfig } from "./config-factory.js";
import { loadYamlOptions } from "./config-loader.js";
import { runInit } from "./init.js";

function getPackageVersion(
  name: string,
  requireFn: ReturnType<typeof createRequire>,
): string | undefined {
  try {
    const mainPath = requireFn.resolve(name);
    let dir = dirname(mainPath);
    while (dir !== dirname(dir)) {
      const pkgPath = resolve(dir, "package.json");
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
          name?: string;
          version?: string;
        };
        if (pkg.name === name && pkg.version) {
          return pkg.version;
        }
      }
      catch {
        // Continue walking up.
      }
      dir = dirname(dir);
    }
  }
  catch {
    // Package main not resolvable; try fallback.
  }

  // Fallback: read directly from node_modules relative to this module.
  try {
    const moduleDir = dirname(fileURLToPath(import.meta.url));
    const pkgPath = resolve(
      moduleDir,
      "..",
      "node_modules",
      name,
      "package.json",
    );
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      name?: string;
      version?: string;
    };
    if (pkg.name === name && pkg.version) {
      return pkg.version;
    }
  }
  catch {
    // Not found in node_modules either.
  }

  return undefined;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

interface ParsedArgs {
  flags: {
    init: boolean;
    force: boolean;
    fix: boolean;
    cache: boolean;
    quiet: boolean;
    version: boolean;
  };
  cacheLocation: string | undefined;
  positional: string[];
}

function parseArgs(rawArgs: string[]): ParsedArgs {
  const flags: ParsedArgs["flags"] = {
    init: false,
    force: false,
    fix: false,
    cache: false,
    quiet: false,
    version: false,
  };
  let cacheLocation: string | undefined;
  const positional: string[] = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    switch (arg) {
      case "--init":
        flags.init = true;
        break;
      case "--force":
        flags.force = true;
        break;
      case "--fix":
        flags.fix = true;
        break;
      case "--cache":
        flags.cache = true;
        break;
      case "--quiet":
        flags.quiet = true;
        break;
      case "--version":
      case "-v":
        flags.version = true;
        break;
      case "--cache-location": {
        const next = rawArgs[++i];
        if (!next) {
          console.error("--cache-location requires a path argument");
          process.exit(1);
        }
        cacheLocation = next;
        break;
      }
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown flag: ${arg}`);
          process.exit(1);
        }
        positional.push(arg);
        break;
    }
  }

  return { flags, cacheLocation, positional };
}

function showVersion(): void {
  let ownVersion: string | undefined;
  let deps: Record<string, string> | undefined;

  try {
    const ownPkgPath = require.resolve("../package.json");
    const ownPkg = JSON.parse(readFileSync(ownPkgPath, "utf-8")) as {
      version?: string;
      dependencies?: Record<string, string>;
    };
    ownVersion = ownPkg.version;
    deps = ownPkg.dependencies;
  }
  catch {
    console.error("Failed to read package metadata.");
    process.exit(1);
  }

  if (!ownVersion) {
    console.error("Package version not found.");
    process.exit(1);
  }

  const patterns = [
    /^eslint$/,
    /^@eslint\//,
    /^@typescript-eslint\//,
    /^typescript-eslint$/,
    /^@html-eslint\//,
    /^@poupe\/eslint-plugin-/,
    /^eslint-plugin-/,
  ];

  const depNames = deps
    ? Object.keys(deps).filter(name =>
      patterns.some(pattern => pattern.test(name))
    )
    : [];

  const pluginVersions: { name: string; version: string; }[] = [];
  for (const name of depNames) {
    const version = getPackageVersion(name, require);
    if (version) {
      pluginVersions.push({ name, version });
    }
  }

  pluginVersions.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`v${ownVersion}`);
  console.log("------");

  const eslintEntry = pluginVersions.find(p => p.name === "eslint");
  if (eslintEntry) {
    console.log(`eslint v${eslintEntry.version}`);
  }

  for (const { name, version } of pluginVersions) {
    if (name !== "eslint") {
      console.log(`${name} v${version}`);
    }
  }
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const { flags, cacheLocation, positional } = parseArgs(rawArgs);

  if (flags.version) {
    showVersion();
    process.exit(0);
  }

  if (flags.init) {
    runInit({ force: flags.force });
    process.exit(0);
  }

  const targets = positional.length > 0 ? positional : ["."];
  const config = createConfig(loadYamlOptions(process.cwd()));

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
    fix: flags.fix,
    cache: flags.cache,
    cacheLocation,
    quiet: flags.quiet,
  });

  let results;
  try {
    results = await eslint.lintFiles(targets);
  }
  catch (e) {
    if (e instanceof Error && e.message.includes("No files matching")) {
      process.exit(0);
    }
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  if (flags.fix) {
    await ESLint.outputFixes(results);
  }

  const formatter = await eslint.loadFormatter();
  const output = await formatter.format(results);
  if (output) {
    console.log(output);
  }

  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run build`

Expected: `dist/index.js`, `dist/auto.js`, `dist/config-factory.js`,
`dist/config-loader.js`, and `dist/init.js` are created without TypeScript
errors.

- [ ] **Step 3: Verify `--version` still works**

Run: `bun dist/index.js --version`

Expected: Multi-line version output with package and dependency versions.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: refactor CLI to programmatic API with curated args"
```

---

## Task 7: Update `package.json`

**Files:**

- Modify: `package.json`

Add the `./auto` subpath export and the `yaml` dependency.

- [ ] **Step 1: Add `exports` and `yaml` dependency**

Replace the existing top-level fields:

```json
"main": "dist/index.js",
"exports": {
  ".": "./dist/index.js",
  "./auto": "./dist/auto.js"
},
```

Add to `dependencies`:

```json
"yaml": "latest",
```

The full `dependencies` block should look like:

```json
"dependencies": {
  "@eslint/css": "latest",
  "@eslint/js": "latest",
  "@eslint/json": "latest",
  "@eslint/markdown": "latest",
  "@html-eslint/eslint-plugin": "latest",
  "@poupe/eslint-plugin-tailwindcss": "latest",
  "@typescript-eslint/parser": "latest",
  "astro-eslint-parser": "latest",
  "eslint": "latest",
  "eslint-plugin-astro": "latest",
  "eslint-plugin-toml": "latest",
  "eslint-plugin-yml": "latest",
  "globals": "latest",
  "typescript-eslint": "latest",
  "yaml": "latest"
},
```

- [ ] **Step 2: Install dependency**

Run: `bun install`

Expected: `bun.lock` updates, `node_modules/yaml` present.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "ops: add ./auto export and yaml dependency"
```

---

## Task 8: Build and End-to-End Verify

- [ ] **Step 1: Full build**

Run: `bun run build`

Expected: No TypeScript errors. All expected files in `dist/`:

```bash
ls dist/
# Expected: auto.js, config-factory.js, config-loader.js, eslint.config.js,
#           index.js, init.js
```

- [ ] **Step 2: Self-lint (smoke test)**

Run: `bun dist/index.js --fix`

Expected: Lints the current project successfully. If there are fixable issues,
they are written. Exit code `0` if no errors.

- [ ] **Step 3: Test `--init` in a temp directory**

```bash
mkdir -p /tmp/linter-init-test && cd /tmp/linter-init-test
node /Users/virajpatel/Projects/github.com/virajp/linter/dist/index.js --init
```

Expected: Creates `eslint.config.mjs`, `.config/linter.yaml`, and
`.vscode/settings.json` with the content from the spec.

Verify:

```bash
cat eslint.config.mjs
cat .config/linter.yaml
cat .vscode/settings.json
```

- [ ] **Step 4: Test `--init --force` overwrite**

```bash
cd /tmp/linter-init-test
node /Users/virajpatel/Projects/github.com/virajp/linter/dist/index.js --init --force
```

Expected: Overwrites `eslint.config.mjs` and `.config/linter.yaml` without
error. `.vscode/settings.json` is merged (still contains
`eslint.useFlatConfig`).

- [ ] **Step 5: Test `--init` fails without `--force` on existing files**

```bash
mkdir -p /tmp/linter-init-test2 && cd /tmp/linter-init-test2
node /Users/virajpatel/Projects/github.com/virajp/linter/dist/index.js --init
node /Users/virajpatel/Projects/github.com/virajp/linter/dist/index.js --init
```

Expected: Second run exits `1` with "already exists" message.

- [ ] **Step 6: Test linting with YAML override**

```bash
cd /tmp/linter-init-test
cat > .config/linter.yaml << 'EOF'
overrides:
  typescript:
    rules:
      "@typescript-eslint/no-explicit-any": "off"
EOF
node /Users/virajpatel/Projects/github.com/virajp/linter/dist/index.js src/index.ts
```

Expected: Runs without error. The YAML override is applied.

- [ ] **Step 7: Format all changed source files**

Run: `mise x -- mise run code:format`

Expected: Formats the new and modified files.

- [ ] **Step 8: Self-lint after formatting**

Run: `bun dist/index.js --fix`

Expected: Passes with exit code `0`.

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: add YAML config, VS Code auto-config, and programmatic CLI"
```

---

## Self-Review Checklist

### 1. Spec Coverage

| Spec Requirement                                | Implementing Task                 |
| ----------------------------------------------- | --------------------------------- |
| YAML schema (`ignores`, `overrides`, `configs`) | Task 2 (loader), Task 3 (factory) |
| `createConfig` factory function                 | Task 3                            |
| `@virajp/linter/auto` export                    | Task 4                            |
| `--init` scaffolds `eslint.config.mjs`          | Task 5                            |
| `--init` scaffolds `.config/linter.yaml`        | Task 5                            |
| `--init` creates/merges `.vscode/settings.json` | Task 5                            |
| `--init --force` overwrite behavior             | Task 5                            |
| CLI uses programmatic API                       | Task 6                            |
| Curated arg parsing (no blind forwarding)       | Task 6                            |
| `--version` preserved                           | Task 6                            |
| `package.json` exports and `yaml` dep           | Task 7                            |
| Config blocks have `name` for targeting         | Task 1                            |

**No gaps identified.**

### 2. Placeholder Scan

- No TBD/TODO/fill-in-details found.
- Every step contains exact file paths, exact code, and exact commands.

### 3. Type Consistency

- `LinterYamlRaw` defined in Task 2, extended as `LinterYamlOptions` in Task 3.
- `createConfig` signature matches the factory code in the design spec.
- `runInit` options interface uses `force?: boolean` consistently.
