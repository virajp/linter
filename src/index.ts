#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  dirname,
  resolve,
} from "node:path";
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
