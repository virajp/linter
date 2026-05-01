#!/usr/bin/env node
import { ESLint } from "eslint";
import {
  readFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import {
  dirname,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import { createConfig } from "./config-factory.js";
import { loadYamlOptions } from "./config-loader.js";
import { runInit } from "./init.js";

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

const require = createRequire(import.meta.url);

interface ParsedArgs {
  flags: {
    init: boolean;
    force: boolean;
    fix: boolean;
    cache: boolean;
    quiet: boolean;
    ignore: boolean;
    debug: boolean;
    version: boolean;
    help: boolean;
  };
  cacheLocation: string | undefined;
  format: string | undefined;
  maxWarnings: number | undefined;
  positional: string[];
}

function parseArgs(rawArgs: string[]): ParsedArgs {
  const flags: ParsedArgs["flags"] = {
    init: false,
    force: false,
    fix: false,
    cache: false,
    quiet: false,
    ignore: true,
    debug: false,
    version: false,
    help: false,
  };
  let cacheLocation: string | undefined;
  let format: string | undefined;
  let maxWarnings: number | undefined;
  const positional: string[] = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) {
      break;
    }
    switch (arg) {
      case "--init":
        flags.init = true;
        break;
      case "--force":
        flags.force = true;
        break;
      case "--fix":
        flags.fix = true;
        break;
      case "--cache":
        flags.cache = true;
        break;
      case "--quiet":
        flags.quiet = true;
        break;
      case "--no-ignore":
        flags.ignore = false;
        break;
      case "--debug":
        flags.debug = true;
        break;
      case "--version":
      case "-v":
        flags.version = true;
        break;
      case "--help":
      case "-h":
        flags.help = true;
        break;
      case "--cache-location": {
        const next = rawArgs[++i];
        if (!next) {
          console.error("--cache-location requires a path argument");
          process.exit(1);
        }
        cacheLocation = next;
        break;
      }
      case "--format":
      case "-f": {
        const next = rawArgs[++i];
        if (!next) {
          console.error("--format requires a format name");
          process.exit(1);
        }
        format = next;
        break;
      }
      case "--max-warnings": {
        const next = rawArgs[++i];
        if (!next || Number.isNaN(Number(next))) {
          console.error("--max-warnings requires a number");
          process.exit(1);
        }
        maxWarnings = Number(next);
        break;
      }
      case "--":
        for (let j = i + 1; j < rawArgs.length; j++) {
          const remaining = rawArgs[j];
          if (remaining !== undefined) {
            positional.push(remaining);
          }
        }
        i = rawArgs.length;
        break;
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown flag: ${arg}`);
          process.exit(1);
        }
        positional.push(arg);
        break;
    }
  }

  return { flags, cacheLocation, format, maxWarnings, positional };
}

function showVersion(): void {
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
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const { flags, cacheLocation, format, maxWarnings, positional } = parseArgs(
    rawArgs,
  );

  if (flags.version) {
    showVersion();
    process.exit(0);
  }

  if (flags.help) {
    console.log(`@askviraj/linter-cli [options] [files...]

Options:
  --init              Scaffold eslint.config.mjs and .config/linter.yaml
  --force             Overwrite existing files when used with --init
  --fix               Automatically fix problems
  --cache             Only check changed files
  --cache-location    Path to the cache file or directory
  --no-ignore         Disable use of ignore files
  --quiet             Report errors only
  --debug             Enable debug logging
  --format, -f        Use a specific output format
  --max-warnings      Number of warnings to trigger nonzero exit code
  --version, -v       Show version
  --help, -h          Show help
`);
    process.exit(0);
  }

  if (flags.init) {
    runInit({ force: flags.force });
    process.exit(0);
  }

  if (flags.debug) {
    const debug = require("debug");
    debug.enable("eslint:*");
  }

  const targets = positional.length > 0 ? positional : ["."];
  const config = createConfig(loadYamlOptions(process.cwd()));

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
    fix: flags.fix,
    cache: flags.cache,
    cacheLocation,
    errorOnUnmatchedPattern: false,
    ignore: flags.ignore,
  });

  let results;
  try {
    results = await eslint.lintFiles(targets);
  }
  catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  if (flags.fix) {
    await ESLint.outputFixes(results);
  }

  if (flags.quiet) {
    results = ESLint.getErrorResults(results);
  }

  const formatter = await eslint.loadFormatter(format);
  const output = await formatter.format(results);
  if (output) {
    console.log(output);
  }

  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
  const failed = errorCount > 0
    || (maxWarnings !== undefined
      && maxWarnings >= 0
      && warningCount > maxWarnings);
  process.exit(failed ? 1 : 0);
}

main().catch(e => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
