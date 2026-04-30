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

With no file arguments, it lints the current directory. All arguments are passed
through to ESLint:

```bash
# Lint specific files or directories
bunx --bun @askviraj/linter-cli src/ lib/

# Auto-fix issues
bunx --bun @askviraj/linter-cli --fix

# Quiet mode (errors only)
bunx --bun @askviraj/linter-cli --quiet

# Cache for faster re-runs
bunx --bun @askviraj/linter-cli --cache
```

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
   - Resolves the bundled `eslint` binary from the package's own dependencies.
   - Points ESLint to the bundled flat config (`dist/eslint.config.js`).
   - Ignores any local `eslint.config.js` in the target repo.
   - Spawns ESLint with `cwd` set to the directory where the command is run.
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

## Configuration

Linter CLI uses its own bundled ESLint flat config. It does **not** read any
`eslint.config.js` or `.eslintrc` files from the target repo. This ensures
consistent linting rules across all projects.

If you need custom rules, you can extend or fork this package.
