import {
  cpSync,
  readdirSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";
import { runCli } from "../helpers/run-cli.js";
import {
  cleanupTempDir,
  createTempDir,
} from "../helpers/temp-dir.js";

// The golden lint output: the CLI lints all of tests/fixtures/, and the
// snapshot records each problem (rule, message ID, position, severity) of each
// file. A second snapshot records the content of each file after --fix. A
// dependency update that changes a problem or a fix changes a snapshot. To
// accept the change, run `mise run test:golden --update` and commit the
// snapshots.

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, "../fixtures");

interface LintMessage {
  ruleId: string | null;
  messageId?: string;
  severity: number;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  fatal?: boolean;
}

interface LintResult {
  filePath: string;
  messages: LintMessage[];
  usedDeprecatedRules: Array<{ ruleId: string }>;
}

function fixtureFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => relative(dir, join(entry.parentPath, entry.name)))
    .sort();
}

async function lintCopy(dir: string, args: string[]) {
  const result = await runCli(
    ["--no-ignore", "--format", "json", ...args, "."],
    dir,
  );
  const results = JSON.parse(result.stdout) as LintResult[];
  return { ...result, results };
}

describe("golden lint output", () => {
  let lintDir: string;
  let fixDir: string;
  let lint: Awaited<ReturnType<typeof lintCopy>>;
  let fix: Awaited<ReturnType<typeof lintCopy>>;

  beforeAll(async () => {
    // The real path, because ESLint reports /private/var/... on macOS.
    lintDir = realpathSync(createTempDir());
    fixDir = realpathSync(createTempDir());
    cpSync(FIXTURES_DIR, lintDir, { recursive: true });
    cpSync(FIXTURES_DIR, fixDir, { recursive: true });
    [lint, fix] = await Promise.all([
      lintCopy(lintDir, []),
      lintCopy(fixDir, ["--fix"]),
    ]);
  });

  afterAll(() => {
    cleanupTempDir(lintDir);
    cleanupTempDir(fixDir);
  });

  test("lints every fixture", () => {
    const linted = lint.results.map(r => relative(lintDir, r.filePath)).sort();
    expect(linted).toEqual(fixtureFiles(FIXTURES_DIR));
  });

  test("writes nothing to stderr", () => {
    expect(lint.stderr).toBe("");
    expect(fix.stderr).toBe("");
  });

  test("uses no deprecated rules", () => {
    const deprecated = lint.results.flatMap(r =>
      r.usedDeprecatedRules.map(d => `${relative(lintDir, r.filePath)}: ${d.ruleId}`)
    );
    expect(deprecated).toEqual([]);
  });

  test("problems", async () => {
    const problems = Object.fromEntries(
      lint.results
        .map(r =>
          [
            relative(lintDir, r.filePath),
            r.messages.map(m => ({
              ruleId: m.ruleId,
              messageId: m.messageId ?? null,
              severity: m.severity,
              line: m.line,
              column: m.column,
              endLine: m.endLine ?? null,
              endColumn: m.endColumn ?? null,
              fatal: m.fatal ?? false,
            })),
          ] as const
        )
        .sort(([a], [b]) => a.localeCompare(b)),
    );
    await expect(`${JSON.stringify(problems, null, 2)}\n`)
      .toMatchFileSnapshot("__snapshots__/lint/problems.json");
  });

  test("fixes", async () => {
    // Only the files that --fix changed, with their new content.
    const fixed = Object.fromEntries(
      fixtureFiles(FIXTURES_DIR)
        .map(file =>
          [
            file,
            readFileSync(join(FIXTURES_DIR, file), "utf8"),
            readFileSync(join(fixDir, file), "utf8"),
          ] as const
        )
        .filter(([, before, after]) => before !== after)
        .map(([file, , after]) => [file, after]),
    );
    await expect(`${JSON.stringify(fixed, null, 2)}\n`)
      .toMatchFileSnapshot("__snapshots__/lint/fixes.json");
  });
});
