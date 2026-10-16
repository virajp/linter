// Installs a built @askviraj/linter and lints the repo's fixtures with it, on
// whatever platform this happens to be running on.
//
// The CLI bundles a native addon (@astrojs/compiler-binding) whose per-platform
// binaries are pulled in as optional dependencies, so a tarball packed on one
// platform can import cleanly there and throw "Cannot find native binding" on
// every other. Only running the published artifact on each platform catches
// that, which is what this script exists to do.
//
//   node .github/scripts/smoke.mjs ./askviraj-linter-1.2.3.tgz
//   node .github/scripts/smoke.mjs @askviraj/linter@1.2.3
//
// A fixture named valid.* must report no errors; every other fixture must
// report at least one problem. Exits non-zero on the first broken expectation.

/* eslint-disable no-console -- the printed report is this script's output */

import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  dirname,
  join,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const FIXTURES = join(REPO_ROOT, "tests", "fixtures");
const PACKAGE_NAME = "@askviraj/linter";

const spec = process.argv[2];

if (!spec) {
  fail("usage: node .github/scripts/smoke.mjs <tarball-path|package@version>");
}

// A bare tarball path has to be absolute: npm resolves it against the install
// directory, which is the temp dir rather than wherever this was invoked from.
const installSpec = spec.endsWith(".tgz") ? resolve(spec) : spec;

const workspace = mkdtempSync(join(tmpdir(), "linter-smoke-"));

writeFileSync(
  join(workspace, "package.json"),
  `${
    JSON.stringify(
      { name: "linter-smoke", version: "0.0.0", private: true, type: "module" },
      null,
      2,
    )
  }\n`,
);
mkdirSync(join(workspace, ".config"));
writeFileSync(join(workspace, ".config", "linter.yaml"), "version: 1\n");
cpSync(FIXTURES, join(workspace, "fixtures"), { recursive: true });

console.log(`platform   ${process.platform}-${process.arch}`);
console.log(`spec       ${installSpec}`);
console.log(`workspace  ${workspace}\n`);

run("npm", [
  "install",
  installSpec,
  "--no-audit",
  "--no-fund",
  "--loglevel=error",
]);

// Invoked through node rather than the .bin shim, which is a shell script on
// POSIX and a .cmd on Windows — this keeps one code path across the matrix.
const cli = join(workspace, "node_modules", PACKAGE_NAME, "dist", "index.js");

reportBundledBindings();

const version = run("node", [cli, "--version"]).split("\n")[0].trim();
console.log(`installed  ${version}\n`);

const report = JSON.parse(run("node", [cli, "--format", "json", "fixtures"]));
const expected = countFixtures(FIXTURES);
const failures = [];

if (report.length !== expected) {
  failures.push(`linted ${report.length} files, expected ${expected}`);
}

for (
  const file of report.sort((a, b) => a.filePath.localeCompare(b.filePath))
) {
  const name = file.filePath.split(sep).slice(-2).join("/");
  const problems = file.errorCount + file.warningCount;
  const shouldBeClean = name.split("/")[1].startsWith("valid.");
  const ok = shouldBeClean ? file.errorCount === 0 : problems > 0;

  console.log(
    `  ${ok ? "ok  " : "FAIL"}  ${name.padEnd(38)} ${file.errorCount} errors, ${file.warningCount} warnings`,
  );

  if (!ok) {
    failures.push(
      shouldBeClean
        ? `${name} should lint clean but reported ${file.errorCount} errors`
        : `${name} should report a problem but lint clean`,
    );
  }
}

if (failures.length > 0) {
  fail(
    `\n${failures.length} broken expectation(s):\n${
      failures
        .map((f) => `  - ${f}`)
        .join("\n")
    }`,
  );
}

console.log(
  `\nall ${report.length} fixtures behaved as expected on ${process.platform}-${process.arch}`,
);

function run(command, args) {
  // npm is a .cmd on Windows, which execFileSync cannot spawn without a shell.
  // A shell means arguments are joined raw, so quote them — the temp workspace
  // and the runner's checkout path can both contain spaces.
  const shell = process.platform === "win32";

  try {
    return execFileSync(command, shell ? args.map((arg) => `"${arg}"`) : args, {
      cwd: workspace,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      shell,
    });
  } catch (error) {
    // ESLint exits 1 whenever it reports an error, which is the expected
    // outcome for most fixtures — the output is still the result we want.
    if (error.stdout) {
      return error.stdout;
    }
    fail(`\`${command} ${args.join(" ")}\` failed: ${error.message}`);
  }
}

// The whole point of the exercise: show which native binaries actually shipped,
// so a tarball built for one platform is obvious in the log even before the
// lint run fails.
function reportBundledBindings() {
  const bindings = join(
    workspace,
    "node_modules",
    PACKAGE_NAME,
    "node_modules",
    "@astrojs",
  );
  const names = readdirSync(bindings).filter((name) => name.startsWith("compiler-binding-"));

  console.log(`bundled native bindings (${names.length}):`);
  for (const name of names.sort()) {
    console.log(`  ${name}`);
  }
  console.log();
}

function countFixtures(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .length;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
