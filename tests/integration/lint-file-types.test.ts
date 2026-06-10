import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { FIXTURES } from "../helpers/fixture-manifest.js";
import {
  runCli,
} from "../helpers/run-cli.js";
import {
  cleanupTempDir,
  copyFixture,
  createTempDir,
} from "../helpers/temp-dir.js";

describe("lint file types", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("lints valid javascript with no errors", async () => {
    copyFixture(FIXTURES.javascript.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid javascript with errors", async () => {
    copyFixture(FIXTURES.javascript.noUndef, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("no-undef");
  });

  test("lints valid typescript with no errors", async () => {
    copyFixture(FIXTURES.typescript.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid typescript with errors", async () => {
    copyFixture(FIXTURES.typescript.noUnusedVars, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("no-unused-vars");
  });

  test("lints valid astro with no errors", async () => {
    copyFixture(FIXTURES.astro.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid astro with errors", async () => {
    copyFixture(FIXTURES.astro.deprecatedResolve, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("astro/no-deprecated-astro-resolve");
  });

  test("lints valid json with no errors", async () => {
    copyFixture(FIXTURES.json.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid json with errors", async () => {
    copyFixture(FIXTURES.json.trailingComma, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Parsing error");
  });

  test("lints valid jsonc with no errors", async () => {
    copyFixture(FIXTURES.jsonc.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid jsonc with errors", async () => {
    copyFixture(FIXTURES.jsonc.missingComma, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Parsing error");
  });

  test("lints valid markdown with no errors", async () => {
    copyFixture(FIXTURES.markdown.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints markdown with empty links", async () => {
    copyFixture(FIXTURES.markdown.emptyLinks, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("no-empty-links");
  });

  test("lints valid yaml with no errors", async () => {
    copyFixture(FIXTURES.yaml.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid yaml with errors", async () => {
    copyFixture(FIXTURES.yaml.duplicateKeys, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Parsing error");
  });

  test("lints valid toml with no errors", async () => {
    copyFixture(FIXTURES.toml.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid toml with errors", async () => {
    copyFixture(FIXTURES.toml.duplicateKeys, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Parsing error");
  });

  test("lints valid html with no errors", async () => {
    copyFixture(FIXTURES.html.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid html with errors", async () => {
    copyFixture(FIXTURES.html.missingAlt, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("require-img-alt");
  });

  test("lints valid css with no errors", async () => {
    copyFixture(FIXTURES.css.valid, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(0);
  });

  test("lints invalid css with errors", async () => {
    copyFixture(FIXTURES.css.unknownProperty, tmpDir);
    const result = await runCli(["--no-ignore", "."], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("no-invalid-properties");
  });
});
