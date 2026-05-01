# Agent Context: @virajp/linter

## What This Project Is

`@virajp/linter` is an **ESLint configuration package** that exports a single,
opinionated flat config covering many file types:

- JavaScript / TypeScript (`js`, `ts`, `jsx`, `tsx`, `mjs`, `cjs`)
- Astro (`.astro`)
- JSON / JSONC (`.json`, `.jsonc`, `tsconfig.json`, `.vscode/*.json`)
- Markdown (`.md`)
- CSS (`.css`)
- YAML (`.yaml`, `.yml`)
- TOML (`.toml`)
- HTML (`.html`)

The main export lives in `src/eslint.config.ts`. It uses the **ESLint flat
config** format (`eslint/config`, `defineConfig`, `globalIgnores`).

`src/index.ts` is the CLI launcher. It reads `.config/linter.yaml` from the
target repo (if present), builds the ESLint config by merging YAML overrides
with the bundled base config via `createConfig()`, and runs ESLint's
programmatic API (`new ESLint()`) on the current working directory.

## Toolchain

| Tool           | Role                       | Config File                      |
| -------------- | -------------------------- | -------------------------------- |
| **Bun**        | Package manager + runtime  | `bunfig.toml`                    |
| **TypeScript** | Language (no emit, strict) | `tsconfig.json`                  |
| **dprint**     | Formatter (not Prettier)   | `dprint.json`                    |
| **ESLint**     | Linter (self-consuming)    | `src/eslint.config.ts`           |
| **mise**       | Dev-tool version manager   | `.config/mise.toml`              |
| **pre-commit** | Git hooks                  | `.config/pre-commit-config.yaml` |

### Bunfig Policies

- Telemetry disabled, `.env` loading disabled.
- Minimum package age: **3 days** (excludes `@types/bun` and `typescript`).
- Security scanner: `@bun-security-scanner/osv`.

### dprint Notes

- Uses **remote WASM plugins** (no npm packages).
- Formats: TS/JS, JSON, Markdown, CSS/SCSS, YAML, TOML (via `taplo`), HTML/Astro
  (via `markup_fmt`), Docker.
- `lineWidth` is **80** across all languages.
- `newLineKind: "lf"`.
- `excludes` cover `node_modules/`, `dist/`, `build/`, lock files, etc.

## Scripts / Tasks

<IMPORTANT_NOTE> While running commands from AI agent, use
`mise x -- mise run <task>` to ensure the correct environment and dependencies
are loaded. For example, to run the lint task, use
`mise x -- mise run code:lint` instead of directly invoking
`mise run code:lint`. Similarly, any tool that is installed via `mise` will be
available in the `mise x` environment, so you can run
`mise x -- mise run code:format` to format code. Always prefix commands with
`mise x --` when executing from an AI agent to ensure proper context and access
to all tools and dependencies. </IMPORTANT_NOTE>

| Script           | Command                                        |
| ---------------- | ---------------------------------------------- |
| `build`          | `bun run build` — Compiles `src/` to `dist/`   |
| `prepublishOnly` | Auto-runs `build` before publishing            |
| `p:build`        | `mise run p:build` — Build the CLI             |
| `p:test`         | `mise run p:test` — Self-lint the build output |
| `p:preview`      | `mise run p:preview` — Preview the tarball     |
| `p:publish`      | `mise run p:publish` — Publish to npm          |

Each step depends on the previous one, so running `mise run p:publish`
automatically triggers `p:build` → `p:test` → `p:preview` → `p:publish`.

Additional tasks are executed via **mise** or directly with Bun:

```bash
# Install dependencies
bun install

# Run formatter
mise run code:format

# Run linter (self-consuming)
bun dist/index.js --fix
```

The `mise.toml` defines `setup = "mise run setup:all"` as a shell alias.

## CLI Usage

Once published, the package is runnable as a self-contained CLI. It bundles its
own ESLint, plugins, and config — target repos do **not** need to install ESLint
or any plugins.

```bash
# Via Bun
bunx --bun @virajp/linter

# Via Node (npx)
npx @virajp/linter
```

### Arguments

The CLI supports a curated set of flags. Unknown flags are rejected to prevent
conflicts with internal config management.

| Flag                      | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `--init`                  | Scaffold `eslint.config.mjs` and `.config/linter.yaml` |
| `--force`                 | Overwrite existing files (with `--init`)               |
| `--fix`                   | Automatically fix problems                             |
| `--cache`                 | Only check changed files                               |
| `--cache-location <path>` | Path to the cache file or directory                    |
| `--no-ignore`             | Disable use of ignore files                            |
| `--quiet`                 | Report errors only                                     |
| `--format`, `-f`          | Use a specific output format                           |
| `--max-warnings <n>`      | Number of warnings to trigger nonzero exit code        |
| `--version`, `-v`         | Show version                                           |
| `--help`, `-h`            | Show help                                              |
| positional args           | Files or directories to lint (default: `.`)            |

```bash
# Lint specific files
bunx --bun @virajp/linter src/ lib/

# Auto-fix issues
bunx --bun @virajp/linter --fix

# Quiet mode (errors only)
bunx --bun @virajp/linter --quiet

# Cache for faster re-runs
bunx --bun @virajp/linter --cache

# Scaffold config files
bunx --bun @virajp/linter --init
```

When no file arguments are provided, the CLI defaults to `.` (the current
working directory).

### How It Works

1. `npx`/`bunx` installs `@virajp/linter` and its dependencies in a
   temporary/local `node_modules`.
2. The `bin` entry (`dist/index.js`) launches a thin wrapper that:
   - Reads `.config/linter.yaml` from the target repo (if present) to load user
     customizations.
   - Builds the ESLint config by merging YAML overrides with the bundled base
     config via `createConfig()`.
   - Uses ESLint's programmatic API (`new ESLint()`) with
     `overrideConfigFile: true` and the built config as `overrideConfig`.
   - Runs `eslint.lintFiles()` on the current working directory.
3. ESLint loads plugins via the config's bare-specifier imports; Node resolves
   them from the package's `node_modules/`, not the target repo's.

### VS Code Integration

The package exports `@virajp/linter/auto` for use with the
`dbaeumer.vscode-eslint` extension.

In your target repo, run:

```bash
npx @virajp/linter --init
```

This scaffolds:

- `eslint.config.mjs` — imports `@virajp/linter/auto`
- `.config/linter.yaml` — your customization file
- `.vscode/settings.json` — enables flat config mode

The VS Code extension discovers `eslint.config.mjs` and loads the auto-config,
which reads `.config/linter.yaml` and returns the merged ESLint config.

### Customizing Rules

Edit `.config/linter.yaml` in your target repo:

```yaml
ignores:
  - "**/generated/**"

overrides:
  typescript:
    rules:
      "@typescript-eslint/no-explicit-any": "error"
```

Run `bun dist/index.js --fix` or let the VS Code extension pick up changes.

## Code Style & Conventions

- **ESLint flat config only** — no `.eslintrc` files.
- **Formatter is dprint, not Prettier** — do not add Prettier configs or ignore
  files.
- **Strict TypeScript** — `strict: true`, `noUnusedLocals`,
  `noUnusedParameters`, `noUncheckedIndexedAccess`, etc.
- **Module style**: `module: "Preserve"`, `moduleResolution: "bundler"`,
  `verbatimModuleSyntax: true`.
- **Quotes**: double quotes preferred (dprint `quoteStyle: "alwaysDouble"`).
- **Trailing commas**: `onlyMultiLine`.
- **Indent**: 2 spaces, no tabs.
- **Line width**: 80.
- **Braces**: `sameLineUnlessHanging`; single-line bodies go on `nextLine`.
- Import sorting is handled by dprint (`sortNamedImports`, `sortNamedExports`);
  do **not** enable `"source.organizeImports"` in VS Code.

## VS Code Settings

- Default formatter: `dbaeumer.vscode-eslint`.
- ESLint config path: `--config 'src/eslint.config.ts'`.
- Import module specifier preference: `non-relative`.

## Adding New File Types / Plugins

When extending `src/eslint.config.ts`:

1. Add the plugin dependency to `package.json` (use `"latest"` to match existing
   conventions).
2. Import the plugin at the top of `src/eslint.config.ts`.
3. Add a new config object inside `defineConfig([...])` with:
   - `name` (descriptive, kebab-case or lowercase)
   - `files` (glob array)
   - `plugins` and/or `extends`
   - `languageOptions` / `language` as needed
4. Run `bun install`, then `bun run build`.
5. Verify with `bun dist/index.js --fix`.
6. Format with `mise run code:format`.

## Security / Hooks

- NEVER commit without explicit instructions from the user. Always ask for
  confirmation before committing.
- **gitleaks** is configured in `.config/gitleaks.toml`.
- **pre-commit** hooks run formatting and linting checks.
- Commit messages follow conventional commits (see
  `.config/git-conventional-commits.yaml`).
