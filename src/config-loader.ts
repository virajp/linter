import {
  existsSync,
  readFileSync,
} from "node:fs";
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
    if (existsSync(candidate)) {
      return candidate;
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
        `[@askviraj/linter-cli] Warning: unknown key "${key}" in .config/linter.yaml`,
      );
    }
  }

  return parsed as LinterYamlRaw;
}
