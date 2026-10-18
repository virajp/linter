import {
  existsSync,
  readFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

export interface LinterYamlRaw {
  version: number | string;
  ignores?: string[];
  overrides?: Record<string, { rules?: Record<string, unknown> }>;
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
    return { version: 1 };
  }

  const content = readFileSync(yamlPath, "utf-8");
  let parsed: Record<string, unknown>;
  try {
    parsed = parse(content) as Record<string, unknown> || {};
  } catch (e) {
    throw new Error(
      `Failed to parse ${yamlPath}: ${e instanceof Error ? e.message : String(e)}`,
      { cause: e },
    );
  }

  if (!("version" in parsed)) {
    throw new Error(`Missing required "version" key in ${yamlPath}`);
  }

  const knownKeys = new Set(["version", "ignores", "overrides", "configs"]);
  for (const key of Object.keys(parsed)) {
    if (!knownKeys.has(key)) {
      console.warn(
        `[@virajp.dev/linter] Warning: unknown key "${key}" in .config/linter.yaml`,
      );
    }
  }

  return parsed as unknown as LinterYamlRaw;
}
