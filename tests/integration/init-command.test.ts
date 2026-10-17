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
} from "vitest";
import { runCli } from "../helpers/run-cli.js";
import {
  cleanupTempDir,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("init command", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("--init creates config files", async () => {
    const result = await runCli(["--init"], tmpDir);
    expect(result.exitCode).toBe(0);
    expect(existsSync(`${tmpDir}/eslint.config.mjs`)).toBe(true);
    expect(existsSync(`${tmpDir}/.config/linter.yaml`)).toBe(true);
    expect(existsSync(`${tmpDir}/.vscode/settings.json`)).toBe(false);
    expect(result.stdout).toMatch(/\[skipped\] .*\.vscode\/settings\.json/);
    expect(result.stdout).not.toContain("--force");
  });

  test("--init skips existing files without --force", async () => {
    await runCli(["--init"], tmpDir);
    const result = await runCli(["--init"], tmpDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("skipped");
    expect(result.stdout).toContain("eslint.config.mjs");
  });

  test("--init --force overwrites existing files", async () => {
    await runCli(["--init"], tmpDir);
    const result = await runCli(["--init", "--force"], tmpDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("overwritten");
    // Verify files still contain expected content
    const eslintContent = readFileSync(`${tmpDir}/eslint.config.mjs`, "utf-8");
    expect(eslintContent).toContain("@virajp.dev/linter/auto");
  });

  test("generated eslint.config.mjs exports from auto", async () => {
    await runCli(["--init"], tmpDir);
    const content = readFileSync(`${tmpDir}/eslint.config.mjs`, "utf-8");
    expect(content).toContain("@virajp.dev/linter/auto");
  });

  test("existing .vscode/settings.json gets flat config enabled", async () => {
    mkdirSync(`${tmpDir}/.vscode`, { recursive: true });
    writeFileSync(
      `${tmpDir}/.vscode/settings.json`,
      "// existing settings\n{}\n",
    );
    const result = await runCli(["--init"], tmpDir);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/\[updated\] .*\.vscode\/settings\.json/);
    const content = readFileSync(`${tmpDir}/.vscode/settings.json`, "utf-8");
    expect(content).toContain("// existing settings");
    expect(content).toContain("\"eslint.useFlatConfig\": true");
  });

  test("generated .config/linter.yaml contains project reference", async () => {
    await runCli(["--init"], tmpDir);
    const content = readFileSync(`${tmpDir}/.config/linter.yaml`, "utf-8");
    expect(content).toContain("@virajp.dev/linter");
    expect(content).toContain("version: 1");
  });
});
