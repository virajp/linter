// Ported from eslint-plugin-toml v1.5.0 (MIT), tests/utils/utils.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert";
import type { ESLint, RuleTester } from "eslint";
import * as tomlESLintParser from "toml-eslint-parser";
import { describe, it } from "vitest";

// ESM compatibility
// eslint-disable-next-line @typescript-eslint/naming-convention -- ESM compat
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention -- ESM compat
const __dirname = path.dirname(__filename);

/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 */
export function unIndent(strings: readonly string[]): string {
  const templateValue = strings[0]!;
  const lines = templateValue.split("\n");
  const minLineIndent = getMinIndent(lines);

  return lines.map((line) => line.slice(minLineIndent)).join("\n");
}

/**
 * for `code` and `output`
 */
export function unIndentCodeAndOutput([code]: readonly string[]): (
  args: readonly string[],
) => {
  code: string;
  output: string;
} {
  const codeLines = code!.split("\n");
  const codeMinLineIndent = getMinIndent(codeLines);

  return ([output]: readonly string[]) => {
    const outputLines = output!.split("\n");
    const minLineIndent = Math.min(
      getMinIndent(outputLines),
      codeMinLineIndent,
    );

    return {
      code: codeLines.map((line) => line.slice(minLineIndent)).join("\n"),
      output: outputLines.map((line) => line.slice(minLineIndent)).join("\n"),
    };
  };
}

/**
 * Get number of minimum indent
 */
function getMinIndent(lines: string[]) {
  const lineIndents = lines
    .filter((line) => line.trim())
    .map((line) => / */u.exec(line)![0].length);
  return Math.min(...lineIndents);
}

/**
 * Load test cases
 */
export function loadTestCases(
  ruleName: string,
  plugin: ESLint.Plugin,
  _options?: any,
  additionals?: {
    valid?: (RuleTester.ValidTestCase | string)[];
    invalid?: RuleTester.InvalidTestCase[];
  },
): {
  valid: RuleTester.ValidTestCase[];
  invalid: RuleTester.InvalidTestCase[];
} {
  const validFixtureRoot = path.resolve(
    __dirname,
    `../fixtures/rules/${ruleName}/valid/`,
  );
  const invalidFixtureRoot = path.resolve(
    __dirname,
    `../fixtures/rules/${ruleName}/invalid/`,
  );

  const valid: (RuleTester.ValidTestCase | string)[] = listupInput(
    validFixtureRoot,
  ).map((inputFile) => getConfig(ruleName, inputFile));

  const fixable = plugin.rules![ruleName]!.meta?.fixable != null;

  const invalid: RuleTester.InvalidTestCase[] = listupInput(
    invalidFixtureRoot,
  ).map((inputFile) => {
    const config = getConfig(ruleName, inputFile);
    const errorFile = inputFile.replace(/input\.toml$/u, "errors.json");
    const outputFile = inputFile.replace(/input\.toml$/u, "output.toml");
    // A missing errors.json or output file fails the test: the loader
    // never writes a fixture.
    const errors = fs.readFileSync(errorFile, "utf8");
    config.errors = JSON.parse(errors);
    if (fixable) {
      const output = fs.readFileSync(outputFile, "utf8");
      config.output = output === config.code ? null : output;
    }

    return config;
  });

  if (additionals) {
    if (additionals.valid) {
      valid.push(...additionals.valid);
    }
    if (additionals.invalid) {
      invalid.push(...additionals.invalid);
    }
  }
  for (const test of valid) {
    if (!(test as any).code) {
      throw new Error(`Empty code: ${(test as any).filename}`);
    }
  }
  for (const test of invalid) {
    if (!test.code) {
      throw new Error(`Empty code: ${test.filename}`);
    }
  }
  if (invalid.some((test) => test.output)) {
    describe(`Output test for ${ruleName}`, () => {
      for (const test of invalid.filter(({ filename }) => isToml(filename!))) {
        it(test.filename!, () => {
          const input = tomlESLintParser.parseForESLint(test.code, {
            tomlVersion: "next",
          });
          const output = tomlESLintParser.parseForESLint(
            test.output ?? test.code,
            {
              tomlVersion: "next",
            },
          );
          assert.deepStrictEqual(
            tomlESLintParser.getStaticTOMLValue(input.ast),
            tomlESLintParser.getStaticTOMLValue(output.ast),
          );
        });
      }
    });
  }
  return {
    valid: valid as RuleTester.ValidTestCase[],
    invalid,
  };
}

function listupInput(rootDir: string) {
  return [...itrListupInput(rootDir)];
}

function* itrListupInput(rootDir: string): IterableIterator<string> {
  for (const filename of fs.readdirSync(rootDir)) {
    if (filename.startsWith("_")) {
      // ignore
      continue;
    }
    const abs = path.join(rootDir, filename);
    if (filename.endsWith("input.toml")) {
      yield abs;
    } else if (fs.statSync(abs).isDirectory()) {
      yield* itrListupInput(abs);
    }
  }
}

function getConfig(ruleName: string, inputFile: string): any {
  const filename = inputFile.slice(inputFile.indexOf(ruleName));
  const code0 = fs.readFileSync(inputFile, "utf8");
  let code, config;
  let configFile: string = inputFile.replace(/input\.toml$/u, "config.json");
  if (!fs.existsSync(configFile)) {
    configFile = path.join(path.dirname(inputFile), "_config.json");
  }
  if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  }
  if (config && typeof config === "object") {
    code = `# ${filename}\n${code0}`;
    return Object.assign({}, config, { code, filename });
  }
  // inline config
  const configStr = /^#([^\n]+)\n/u.exec(code0);
  if (!configStr) {
    // The loader never writes a fixture: a missing config fails the test.
    throw new Error("missing config");
  } else {
    code = code0.replace(/^#([^\n]+)\n/u, `# ${filename}\n`);
    try {
      config = configStr ? JSON.parse(configStr[1]!) : {};
    } catch (e: any) {
      throw new Error(`${e.message} in @ ${inputFile}`);
    }
  }

  return Object.assign({}, config, { code, filename });
}

function isToml(fileName: string) {
  return fileName.endsWith(".toml");
}
