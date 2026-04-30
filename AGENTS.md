# Agent Context: @askviraj/linter-cli

## What This Project Is

`@askviraj/linter-cli` is an **ESLint configuration package** that exports a
single, opinionated flat config covering many file types:

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

`src/index.ts` is the CLI launcher. It spawns the bundled ESLint binary with the
bundled flat config (`dist/eslint.config.js`), linting the current working
directory.

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

| Script           | Command                                      |
| ---------------- | -------------------------------------------- |
| `build`          | `bun run build` — Compiles `src/` to `dist/` |
| `prepublishOnly` | Auto-runs `build` before publishing          |

Additional tasks are executed via **mise** or directly with Bun:

```bash
# Install dependencies
bun install

# Run formatter
dprint fmt

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
bunx --bun @askviraj/linter-cli

# Via Node (npx)
npx @askviraj/linter-cli
```

### Arguments

All arguments are passed through to ESLint:

```bash
# Lint specific files
bunx --bun @askviraj/linter-cli src/ lib/

# Auto-fix issues
bunx --bun @askviraj/linter-cli --fix

# Quiet mode (errors only)
bunx --bun @askviraj/linter-cli --quiet

# Cache for faster re-runs
bunx --bun @askviraj/linter-cli --cache
```

When no file arguments are provided, the CLI defaults to `.` (the current
working directory).

### How It Works

1. `npx`/`bunx` installs `@askviraj/linter-cli` and its dependencies in a
   temporary/local `node_modules`.
2. The `bin` entry (`dist/index.js`) launches a thin wrapper that:
   - Resolves the bundled `eslint` binary from the package's own dependencies.
   - Points ESLint to the bundled `dist/eslint.config.js` via `--config`.
   - Uses `--no-config-lookup` so the target repo's local `eslint.config.js` is
     ignored.
   - Spawns ESLint with `cwd: process.cwd()` so files are resolved relative to
     where the command is run.
3. ESLint loads plugins via the config's bare-specifier imports; Node resolves
   them from the package's `node_modules/`, not the target repo's.

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
6. Format with `dprint fmt`.

## Security / Hooks

- **gitleaks** is configured in `.config/gitleaks.toml`.
- **pre-commit** hooks run formatting and linting checks.
- Commit messages follow conventional commits (see
  `.config/git-conventional-commits.yaml`).
