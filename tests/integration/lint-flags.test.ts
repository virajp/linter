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
  writeFileSync,
} from "node:fs";
import { FIXTURES } from "../helpers/fixture-manifest.js";
import {
  runCli,
  runCliJson,
} from "../helpers/run-cli.js";
import {
  cleanupTempDir,
  copyFixture,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("lint flags", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("--fix auto-fixes prefer-as-const", async () => {
    const fixturePath = copyFixture(FIXTURES.typescript.preferAsConst, tmpDir);
    const before = readFileSync(fixturePath, "utf-8");
    expect(before).toContain("as \"production\"");

    const result = await runCli(["--fix", "--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);

    const after = readFileSync(fixturePath, "utf-8");
    expect(after).toContain("as const");
  });

  test("--cache creates cache file", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const cacheDir = createTempDir("linter-cache-");
    try {
      const result = await runCli([
        "--cache",
        "--cache-location",
        `${cacheDir}/.eslintcache`,
        "--no-ignore",
        ".",
      ], tmpDir);
      expect(result.exitCode).toBe(0);
      expect(existsSync(`${cacheDir}/.eslintcache`)).toBe(true);
    }
    finally {
      cleanupTempDir(cacheDir);
    }
  });

  test("--quiet suppresses warnings", async () => {
    copyFixture(FIXTURES.javascript.consoleWarn, tmpDir);
    const normalResult = await runCliJson(["--no-ignore", "."], tmpDir);
    const normalWarnings = normalResult.reduce(
      (sum, r) => sum + (r.warningCount as number),
      0,
    );
    expect(normalWarnings).toBeGreaterThan(0);

    const quietResult = await runCliJson(
      ["--quiet", "--no-ignore", "."],
      tmpDir,
    );
    const quietErrorCount = quietResult.reduce(
      (sum, r) => sum + (r.errorCount as number),
      0,
    );
    const quietWarningCount = quietResult.reduce(
      (sum, r) => sum + (r.warningCount as number),
      0,
    );
    expect(quietErrorCount).toBe(0);
    expect(quietWarningCount).toBe(0);
  });

  test("--format json outputs valid JSON", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const result = await runCli(
      ["--format", "json", "--no-ignore", "."],
      tmpDir,
    );
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test("--max-warnings fails when exceeded", async () => {
    copyFixture(FIXTURES.javascript.consoleWarn, tmpDir);
    const result = await runCli([
      "--max-warnings",
      "0",
      "--no-ignore",
      ".",
    ], tmpDir);
    expect(result.exitCode).toBe(1);
  });

  test("--max-warnings passes when not exceeded", async () => {
    copyFixture(FIXTURES.javascript.consoleWarn, tmpDir);
    const result = await runCli([
      "--max-warnings",
      "10",
      "--no-ignore",
      ".",
    ], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("positional args target specific files", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    copyFixture(FIXTURES.javascript.noUndef, tmpDir);
    const result = await runCli(["--no-ignore", "valid.js"], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("--no-ignore processes custom-ignored files", async () => {
    // AGENTS.md is in the base config's globalIgnores
    writeFileSync(`${tmpDir}/AGENTS.md`, "# Test\n\n[empty]()\n");

    // Without --no-ignore, AGENTS.md is skipped → exit 0
    const withoutFlag = await runCli(["."], tmpDir);
    expect(withoutFlag.exitCode).toBe(0);

    // With --no-ignore, the global ignore is stripped → exit 1
    const withFlag = await runCli(["--no-ignore", "."], tmpDir);
    expect(withFlag.exitCode).toBe(1);
  });

  test("--debug does not crash", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const result = await runCli(["--debug", "--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });
});
