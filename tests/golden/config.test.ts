import { ESLint } from "eslint";
import {
  describe,
  expect,
  test,
} from "vitest";
import { createConfig } from "../../dist/config-factory.js";
import { markdownProcessorConfig } from "../../dist/config/markdown-processor.js";

// The golden config: for each file type, the language and every rule with its
// severity and options that the shipped config (dist/) gives. A dependency
// update that adds, removes or changes a rule changes a snapshot. To accept
// the change, run `mise run test:golden --update` and commit the snapshots.

// One path for each file type that the config matches. The `.md/N.ext` paths
// are the virtual files of fenced code blocks in Markdown.
const PATHS = [
  "file.js",
  "file.mjs",
  "file.cjs",
  "file.jsx",
  "file.ts",
  "file.mts",
  "file.cts",
  "file.tsx",
  "file.astro",
  "file.json",
  "file.jsonc",
  "tsconfig.json",
  "tsconfig.build.json",
  ".vscode/settings.json",
  "file.md",
  "file.md/0.js",
  "file.md/0.ts",
  "file.md/0.json",
  "file.css",
  "file.yaml",
  "file.yml",
  "file.toml",
  "file.html",
] as const;

const SEVERITY = ["off", "warn", "error"] as const;

type RuleEntry = number | string | [number | string, ...unknown[]];

// Writes each rule as [severity, ...options], with the severity as a word, so
// that "error", 2 and ["error"] give the same snapshot.
function normalizeRule(entry: RuleEntry): unknown[] {
  const [level, ...options] = Array.isArray(entry) ? entry : [entry];
  const severity = typeof level === "number" ? SEVERITY[level] : level;
  return [severity, ...options];
}

function sortedRules(
  rules: Record<string, RuleEntry> | undefined,
): Record<string, unknown[]> {
  return Object.fromEntries(
    Object.entries(rules ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, entry]) => [name, normalizeRule(entry)]),
  );
}

type Plugins = Record<
  string,
  { languages?: Record<string, unknown>; processors?: Record<string, unknown> }
>;

// calculateConfigForFile gives the language and the processor as objects. Find
// the "plugin/name" that the config used, so that the snapshot shows the name.
function pluginItemName(
  plugins: Plugins | undefined,
  kind: "languages" | "processors",
  item: unknown,
): string | null {
  if (item === undefined) {
    return null;
  }
  for (const [pluginName, plugin] of Object.entries(plugins ?? {})) {
    for (const [name, value] of Object.entries(plugin[kind] ?? {})) {
      if (value === item) {
        return `${pluginName}/${name}`;
      }
    }
  }
  return "unknown";
}

function parserName(languageOptions: Record<string, unknown> | undefined) {
  const parser = languageOptions?.["parser"] as
    | { meta?: { name?: string } }
    | undefined;
  return parser?.meta?.name ?? null;
}

describe("golden config", () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [...createConfig(), markdownProcessorConfig],
  });

  test.each(PATHS)("%s", async (path) => {
    const config = await eslint.calculateConfigForFile(path);
    const snapshot = config
      ? {
        language: pluginItemName(config.plugins, "languages", config.language),
        parser: parserName(config.languageOptions),
        processor: pluginItemName(
          config.plugins,
          "processors",
          config.processor,
        ),
        rules: sortedRules(config.rules),
      }
      : null;
    const file = path.replaceAll("/", "__");
    await expect(`${JSON.stringify(snapshot, null, 2)}\n`)
      .toMatchFileSnapshot(`__snapshots__/config/${file}.json`);
  });
});
