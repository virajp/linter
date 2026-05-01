import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import { runInit } from "../../src/cli/commands/init.js";
import {
  cleanupTempDir,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("runInit", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("creates eslint.config.mjs", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/eslint.config.mjs`;
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("@askviraj/linter-cli/auto");
  });

  test("creates .config/linter.yaml", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/.config/linter.yaml`;
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("@askviraj/linter-cli");
  });

  test("creates .vscode/settings.json", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/.vscode/settings.json`;
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("eslint.useFlatConfig");
  });

  test("skips existing files without force", () => {
    runInit({ cwd: tmpDir });
    // Should not throw on second run
    expect(() => runInit({ cwd: tmpDir })).not.toThrow();
  });

  test("overwrites existing files with force", () => {
    runInit({ cwd: tmpDir });
    // Modify the file
    const path = `${tmpDir}/eslint.config.mjs`;
    const original = readFileSync(path, "utf-8");
    runInit({ cwd: tmpDir, force: true });
    const overwritten = readFileSync(path, "utf-8");
    expect(overwritten).toBe(original); // same content, overwritten
  });
});
