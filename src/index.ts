#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  dirname,
  resolve,
} from "node:path";

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
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Resolve the ESLint binary from this package's own dependencies.
const eslintPkg = require.resolve("eslint/package.json");
const eslintBin = resolve(dirname(eslintPkg), "bin/eslint.js");

// Resolve the bundled flat-config shipped alongside this CLI.
const configPath = resolve(__dirname, "eslint.config.js");

const rawArgs = process.argv.slice(2);

// Separate flags from positional file arguments.
const flags: string[] = [];
const positional: string[] = [];
let seenDoubleDash = false;

for (const arg of rawArgs) {
  if (seenDoubleDash) {
    positional.push(arg);
  }
  else if (arg === "--") {
    seenDoubleDash = true;
  }
  else if (arg.startsWith("-")) {
    flags.push(arg);
  }
  else {
    positional.push(arg);
  }
}

// Handle version flags before spawning ESLint.
if (flags.includes("--version") || flags.includes("-v")) {
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

  process.exit(0);
}

// Default to the current working directory when no files are specified.
const targets = positional.length > 0 ? positional : ["."];

const args = [
  "--no-config-lookup",
  "--config",
  configPath,
  "--pass-on-no-patterns",
  "--exit-on-fatal-error",
  "--no-error-on-unmatched-pattern",
  ...flags,
  ...targets,
];

const result = spawnSync(process.execPath, [eslintBin, ...args], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
