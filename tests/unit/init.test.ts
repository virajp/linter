import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
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
    expect(content).toContain("@virajp.dev/linter/auto");
  });

  test("creates .config/linter.yaml", () => {
    runInit({ cwd: tmpDir });
    const path = `${tmpDir}/.config/linter.yaml`;
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("@virajp.dev/linter");
    expect(content).toContain("version: 1");
  });

  function captureLog(fn: () => void): string {
    const { output, error } = captureLogAndError(fn);
    if (error !== undefined) throw error;
    return output;
  }

  function captureLogAndError(fn: () => void): {
    output: string;
    error: unknown;
  } {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    let error: unknown;
    try {
      fn();
    } catch (e) {
      error = e;
    }
    const output = spy.mock.calls.map((args) => args.join(" ")).join("\n");
    spy.mockRestore();
    return { output, error };
  }

  test("skips .vscode/settings.json when it does not exist", () => {
    const output = captureLog(() => runInit({ cwd: tmpDir }));
    expect(existsSync(`${tmpDir}/.vscode`)).toBe(false);
    expect(output).toContain(
      `[skipped] ${tmpDir}/.vscode/settings.json`,
    );
  });

  test("does not create settings.json when only .vscode/ exists", () => {
    mkdirSync(`${tmpDir}/.vscode`, { recursive: true });
    const output = captureLog(() => runInit({ cwd: tmpDir }));
    expect(existsSync(`${tmpDir}/.vscode/settings.json`)).toBe(false);
    expect(output).toMatch(/\[skipped\] .*\/\.vscode\/settings\.json/);
  });

  test("does not create settings.json with force", () => {
    captureLog(() => runInit({ cwd: tmpDir, force: true }));
    expect(existsSync(`${tmpDir}/.vscode/settings.json`)).toBe(false);
    expect(existsSync(`${tmpDir}/.vscode`)).toBe(false);
  });

  test("prints no --force hint when only settings.json is skipped", () => {
    const output = captureLog(() => runInit({ cwd: tmpDir }));
    expect(output).not.toContain("--force");
  });

  test("prints the --force hint when eslint.config.mjs is skipped", () => {
    writeFileSync(`${tmpDir}/eslint.config.mjs`, "// existing\n");
    const output = captureLog(() => runInit({ cwd: tmpDir }));
    expect(output).toContain("Use --force to overwrite.");
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
    expect(overwritten).toContain("@virajp.dev/linter/auto");
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

  test.each([
    ["empty", ""],
    ["comments only", "// a comment\n/* another */\n"],
    ["not JSON", "this is not json\n"],
  ])("does not overwrite a settings.json with no JSON root (%s)", (_, text) => {
    mkdirSync(`${tmpDir}/.vscode`, { recursive: true });
    const path = `${tmpDir}/.vscode/settings.json`;
    writeFileSync(path, text);
    const { output, error } = captureLogAndError(() => runInit({ cwd: tmpDir }));
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      "The file contains invalid JSONC. Fix the file and try again.",
    );
    expect(output).toContain(`[failed] ${path}`);
    expect(readFileSync(path, "utf-8")).toBe(text);
  });

  test("does not write a settings.json with a JSONC syntax error", () => {
    mkdirSync(`${tmpDir}/.vscode`, { recursive: true });
    const path = `${tmpDir}/.vscode/settings.json`;
    const text = "{ \"a\": [1, }";
    writeFileSync(path, text);
    const { output, error } = captureLogAndError(() => runInit({ cwd: tmpDir }));
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      "The file contains invalid JSONC. Fix the file and try again.",
    );
    expect(output).toContain(`[failed] ${path}`);
    expect(readFileSync(path, "utf-8")).toBe(text);
  });

  test("merges a valid settings.json with comments and trailing commas", () => {
    mkdirSync(`${tmpDir}/.vscode`, { recursive: true });
    const path = `${tmpDir}/.vscode/settings.json`;
    writeFileSync(path, "{\n  // a comment\n  \"a\": [1, 2,],\n}\n");
    const output = captureLog(() => runInit({ cwd: tmpDir }));
    expect(output).toContain(`[updated] ${path}`);
    const content = readFileSync(path, "utf-8");
    expect(content).toContain("// a comment");
    expect(content).toContain("\"eslint.useFlatConfig\": true");
  });
});
