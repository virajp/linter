import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import {
  dirname,
  join,
  resolve,
} from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
} from "node:url";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import {
  cleanupTempDir,
  createTempDir,
} from "../helpers/temp-dir.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTO_URL = pathToFileURL(resolve(__dirname, "../../dist/auto.js")).href;
const ESLINT_URL = pathToFileURL(createRequire(import.meta.url).resolve("eslint"))
  .href;

// The VS Code ESLint extension loads eslint.config.mjs of the repo, which
// re-exports @virajp.dev/linter/auto. This test does the same with the ESLint
// API in a child process, because dist/auto.js reads .config/linter.yaml from
// the working directory when it loads.
const SCRIPT = `
import { ESLint } from ${JSON.stringify(ESLINT_URL)};
const eslint = new ESLint();
const results = await eslint.lintFiles(["."]);
console.log(JSON.stringify(results.map(r => ({
  file: r.filePath.slice(process.cwd().length + 1),
  rules: r.messages.map(m => m.ruleId),
}))));
`;

describe("/auto export", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  test("gives the base config and the overrides of linter.yaml", () => {
    writeFileSync(
      join(tmpDir, "eslint.config.mjs"),
      `export { default } from ${JSON.stringify(AUTO_URL)};\n`,
    );
    mkdirSync(join(tmpDir, ".config"));
    writeFileSync(
      join(tmpDir, ".config/linter.yaml"),
      [
        "version: 1",
        "ignores:",
        "  - \"ignored/**\"",
        "overrides:",
        "  javascript:",
        "    rules:",
        "      no-debugger: \"off\"",
        "",
      ].join("\n"),
    );
    writeFileSync(join(tmpDir, "code.js"), "debugger;\nundefinedName();\n");
    writeFileSync(join(tmpDir, "data.json"), "{ \"a\": 1, }\n");
    mkdirSync(join(tmpDir, "ignored"));
    writeFileSync(join(tmpDir, "ignored/skip.js"), "undefinedName();\n");

    const stdout = execFileSync(
      "node",
      ["--input-type=module", "--eval", SCRIPT],
      { cwd: tmpDir, encoding: "utf8" },
    );
    const results = (JSON.parse(stdout) as Array<{ file: string; rules: unknown[] }>)
      .sort((a, b) => a.file.localeCompare(b.file));

    expect(results).toEqual([
      // The YAML preset applies to the config file of the linter too.
      { file: ".config/linter.yaml", rules: [] },
      // no-debugger is off through linter.yaml. no-undef stays.
      { file: "code.js", rules: ["no-undef"] },
      // The JSON preset applies: a trailing comma is a parsing error.
      { file: "data.json", rules: [null] },
      // eslint.config.mjs is linted by the javascript preset too.
      { file: "eslint.config.mjs", rules: [] },
    ]);
  }, 60_000);
});
