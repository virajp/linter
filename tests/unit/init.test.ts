import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
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
    expect(content).toContain("version: 1");
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
    // Modify eslint.config.mjs to track if it gets overwritten
    const path = `${tmpDir}/eslint.config.mjs`;
    const modifiedContent = "// modified\n";
    writeFileSync(path, modifiedContent);
    // Second run should not overwrite
    runInit({ cwd: tmpDir });
    expect(readFileSync(path, "utf-8")).toBe(modifiedContent);
  });

  test("overwrites existing files with force", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/eslint.config.mjs`;
    const modifiedContent = "// modified\n";
    writeFileSync(path, modifiedContent);
    runInit({ cwd: tmpDir, force: true });
    const overwritten = readFileSync(path, "utf-8");
    expect(overwritten).not.toBe(modifiedContent);
    expect(overwritten).toContain("@askviraj/linter-cli/auto");
  });

  test("updates existing vscode settings with false flat config", () => {
    mkdirSync(`${tmpDir}/.vscode`, { recursive: true });
    writeFileSync(
      `${tmpDir}/.vscode/settings.json`,
      JSON.stringify({ "eslint.useFlatConfig": false }) + "\n",
    );
    runInit({ cwd: tmpDir });
    const content = readFileSync(`${tmpDir}/.vscode/settings.json`, "utf-8");
    expect(content).toContain("true");
  });

  test("leaves up-to-date vscode settings unchanged", () => {
    mkdirSync(`${tmpDir}/.vscode`, { recursive: true });
    writeFileSync(
      `${tmpDir}/.vscode/settings.json`,
      JSON.stringify({ "eslint.useFlatConfig": true, "other.setting": 1 })
        + "\n",
    );
    runInit({ cwd: tmpDir });
    const content = readFileSync(`${tmpDir}/.vscode/settings.json`, "utf-8");
    expect(content).toContain("\"other.setting\":1");
  });
});
