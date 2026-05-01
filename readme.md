# Linter CLI

A self-contained linter CLI for JavaScript, TypeScript, Astro, JSON, JSONC, CSS,
HTML, Markdown, YAML, TOML, and more.

Linter CLI bundles ESLint and all its plugins so you don't have to install them
in every repo. Run it anywhere with `npx` or `bunx` and it lints the current
directory using an opinionated flat config.

## Usage

```bash
# Via Bun
bunx --bun @virajp/linter

# Via Node
npx @virajp/linter
```

With no file arguments, it lints the current directory. The CLI supports a
curated set of flags:

```bash
# Lint specific files or directories
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

When you run `npx @virajp/linter` or `bunx --bun @virajp/linter`:

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
bun add -D @virajp/linter
# or
npm install -D @virajp/linter
```

Then run it with:

```bash
bunx @virajp/linter
# or
npx @virajp/linter
```

## VS Code Integration

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

Run `bunx --bun @virajp/linter --fix` or let the VS Code extension pick up
changes.

## Configuration

Linter CLI uses its own bundled ESLint flat config as the base. By default, it
does not read any `eslint.config.js` or `.eslintrc` files from the target repo.

For per-repo customization, use `.config/linter.yaml` (see
[Customizing Rules](#customizing-rules)) or scaffold with `--init`.

## License

MIT — see [LICENSE](./LICENSE) for details.
