import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  dirname,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

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

  try {
    const moduleDir = dirname(fileURLToPath(import.meta.url));
    const pkgPath = resolve(
      moduleDir,
      "..",
      "..",
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

export function runVersion(): void {
  let ownVersion: string | undefined;
  let deps: Record<string, string> | undefined;

  try {
    const ownPkgPath = require.resolve("../../../package.json");
    const ownPkg = JSON.parse(readFileSync(ownPkgPath, "utf-8")) as {
      version?: string;
      dependencies?: Record<string, string>;
    };
    ownVersion = ownPkg.version;
    deps = ownPkg.dependencies;
  }
  catch {
    throw new Error("Failed to read package metadata.");
  }

  if (!ownVersion) {
    throw new Error("Package version not found.");
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
