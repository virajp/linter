# @virajp/linter

A self-contained linter CLI for JavaScript, TypeScript, Astro, JSON, JSONC, CSS,
HTML, Markdown, YAML, TOML, and more. It bundles ESLint and all plugins so you
don't have to install them in every project.

## Features

- **Zero-config** — Works out of the box with an opinionated flat config
- **Self-contained** — Bundles ESLint and all plugins; no peer dependency
  headaches
- **Multi-language** — One command lints 10+ file types
- **Fast** — Optional caching and native Bun support
- **VS Code ready** — First-class integration with the official ESLint extension

## Installation

No installation required for one-off use:

```bash
# Via Bun
bunx --bun jsr run @virajp/linter

# Via npx
npx jsr run @virajp/linter
```

Install locally for faster repeated runs:

```bash
# With Bun
bunx --bun jsr add --save-dev @virajp/linter

# With npm
npx jsr add --save-dev @virajp/linter
```

## Quick Start

```bash
# Lint the current directory
bunx --bun @virajp/linter

# Lint specific files or directories
bunx --bun @virajp/linter src/ tests/

# Auto-fix issues
bunx --bun @virajp/linter --fix

# Scaffold config files for your project
bunx --bun @virajp/linter --init
```

## Supported File Types

| Language   | Extensions                                  |
| ---------- | ------------------------------------------- |
| JavaScript | `.js`, `.mjs`, `.cjs`, `.jsx`               |
| TypeScript | `.ts`, `.mts`, `.cts`, `.tsx`               |
| Astro      | `.astro`                                    |
| JSON       | `.json`                                     |
| JSONC      | `.jsonc`, `tsconfig.json`, `.vscode/*.json` |
| Markdown   | `.md`                                       |
| CSS        | `.css`                                      |
| YAML       | `.yaml`, `.yml`                             |
| TOML       | `.toml`                                     |
| HTML       | `.html`                                     |

## CLI Reference

| Flag                      | Short | Description                                                                      |
| ------------------------- | ----- | -------------------------------------------------------------------------------- |
| `--init`                  |       | Scaffold `eslint.config.mjs`, `.config/linter.yaml`, and `.vscode/settings.json` |
| `--force`                 |       | Overwrite existing files when used with `--init`                                 |
| `--fix`                   |       | Automatically fix problems                                                       |
| `--cache`                 |       | Only check changed files                                                         |
| `--cache-location <path>` |       | Path to the cache file or directory                                              |
| `--no-ignore`             |       | Disable use of ignore files                                                      |
| `--quiet`                 |       | Report errors only                                                               |
| `--debug`                 |       | Enable ESLint debug logging                                                      |
| `--format`, `-f <name>`   |       | Use a specific output format                                                     |
| `--max-warnings <n>`      |       | Number of warnings to trigger nonzero exit code                                  |
| `--version`, `-v`         |       | Show version and plugin versions                                                 |
| `--help`, `-h`            |       | Show help                                                                        |

Positional arguments are treated as file or directory targets. Defaults to `.`
when none are provided. Use `--` to pass file names that look like flags (for
example, `linter -- --fix.js`).

## Configuration

### `.config/linter.yaml`

Create this file in your repo to customize the bundled config:

```yaml
version: 1

ignores:
  - "**/generated/**"
  - "**/*.d.ts"

overrides:
  typescript:
    rules:
      "@typescript-eslint/no-explicit-any": "error"

configs:
  - name: "custom"
    files: [ "**/*.test.ts" ]
    rules:
      "no-console": "off"
```

#### Supported keys

| Key         | Type                        | Description                                               |
| ----------- | --------------------------- | --------------------------------------------------------- |
| `version`   | `number \| string`          | **Required.** Schema version (currently `1`).             |
| `ignores`   | `string[]`                  | Additional global ignore patterns.                        |
| `overrides` | `Record<string, { rules }>` | Rule overrides keyed by preset name.                      |
| `configs`   | `unknown[]`                 | Raw ESLint config objects appended after the base config. |

#### Preset names for `overrides`

Use these names in the `overrides` section:

- `javascript`
- `typescript`
- `astro`
- `json`
- `jsonc`
- `markdown`
- `markdown-typescript`
- `yaml`
- `toml`
- `html`
- `css`

### Scaffolding

Run `--init` to create the following files in your project:

- `eslint.config.mjs` — imports `@virajp/linter/auto`
- `.config/linter.yaml` — your customization file
- `.vscode/settings.json` — enables flat config mode

Use `--force` to overwrite existing files.

## VS Code Integration

The package exports `@virajp/linter/auto` for use with the
`dbaeumer.vscode-eslint` extension.

After running `--init`, VS Code discovers `eslint.config.mjs` and loads the
bundled config automatically. Edit `.config/linter.yaml` to customize rules; the
extension picks up changes without restarting.

## How It Works

1. `npx` or `bunx` installs `@virajp/linter` and its dependencies in a temporary
   or local `node_modules`.
2. The bundled CLI reads `.config/linter.yaml` from the target repo (if present)
   to load user customizations.
3. It builds the ESLint config by merging YAML overrides with the bundled base
   config.
4. ESLint's programmatic API lints the current working directory. Plugins are
   resolved from the package's own `node_modules`, not the target repo's.

## License

MIT — see [LICENSE](./LICENSE) for details.
