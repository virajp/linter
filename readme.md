# Linter CLI

A self-contained linter CLI for JavaScript, TypeScript, Astro, JSON, JSONC, CSS,
HTML, Markdown, YAML, TOML, and more.

Linter CLI bundles ESLint and all its plugins so you don't have to install them
in every repo. Run it anywhere with `npx` or `bunx` and it lints the current
directory using an opinionated flat config.

## Usage

```bash
# Via Bun
bunx --bun @askviraj/linter-cli

# Via Node
npx @askviraj/linter-cli
```

With no file arguments, it lints the current directory. The CLI supports a
curated set of flags:

```bash
# Lint specific files or directories
bunx --bun @askviraj/linter-cli src/ lib/

# Auto-fix issues
bunx --bun @askviraj/linter-cli --fix

# Quiet mode (errors only)
bunx --bun @askviraj/linter-cli --quiet

# Cache for faster re-runs
bunx --bun @askviraj/linter-cli --cache

# Scaffold config files
bunx --bun @askviraj/linter-cli --init
```

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

## Supported File Types

- **JavaScript / TypeScript** — `.js`, `.ts`, `.jsx`, `.tsx`, `.mjs`, `.cjs`
- **Astro** — `.astro`
- **JSON / JSONC** — `.json`, `.jsonc`, `tsconfig.json`, `.vscode/*.json`
- **Markdown** — `.md`
- **CSS / Tailwind CSS** — `.css`
- **YAML** — `.yaml`, `.yml`
- **TOML** — `.toml`
- **HTML** — `.html`

## How It Works

When you run `npx @askviraj/linter-cli` or `bunx --bun @askviraj/linter-cli`:

1. The package is installed with all its dependencies in a temporary or local
   `node_modules`.
2. The bundled CLI entry point (`dist/index.js`) launches a thin wrapper that:
   - Reads `.config/linter.yaml` from the target repo (if present) to load user
     customizations.
   - Builds the ESLint config by merging YAML overrides with the bundled base
     config via `createConfig()`.
   - Uses ESLint's programmatic API (`new ESLint()`) with
     `overrideConfigFile: true` and the built config as `overrideConfig`.
   - Runs `eslint.lintFiles()` on the current working directory.
3. ESLint loads plugins via the config's imports; Node resolves them from the
   package's `node_modules/`, not the target repo's.

## Installation

No installation is required — `npx` and `bunx` handle it automatically. If you
prefer to install it locally:

```bash
bun add -D @askviraj/linter-cli
# or
npm install -D @askviraj/linter-cli
```

Then run it with:

```bash
bunx @askviraj/linter-cli
# or
npx @askviraj/linter-cli
```

## VS Code Integration

The package exports `@askviraj/linter-cli/auto` for use with the
`dbaeumer.vscode-eslint` extension.

In your target repo, run:

```bash
npx @askviraj/linter-cli --init
```

This scaffolds:

- `eslint.config.mjs` — imports `@askviraj/linter-cli/auto`
- `.config/linter.yaml` — your customization file
- `.vscode/settings.json` — enables flat config mode

The VS Code extension discovers `eslint.config.mjs` and loads the auto-config,
which reads `.config/linter.yaml` and returns the merged ESLint config.

## Customizing Rules

Edit `.config/linter.yaml` in your target repo:

```yaml
ignores:
  - "**/generated/**"

overrides:
  typescript:
    rules:
      "@typescript-eslint/no-explicit-any": "error"
```

Run `bunx --bun @askviraj/linter-cli --fix` or let the VS Code extension pick up
changes.

## Configuration

Linter CLI uses its own bundled ESLint flat config as the base. By default, it
does not read any `eslint.config.js` or `.eslintrc` files from the target repo.

For per-repo customization, use `.config/linter.yaml` (see
[Customizing Rules](#customizing-rules)) or scaffold with `--init`.

## License

MIT — see [LICENSE](./LICENSE) for details.
