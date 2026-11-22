// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/utils/utils.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert";
import type { ESLint, RuleTester } from "eslint";
import * as yamlESLintParser from "yaml-eslint-parser";
import { describe, it } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));

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
  options?: { skipOutputTest?: boolean },
  additionals?: {
    valid?: (RuleTester.ValidTestCase | string)[];
    invalid?: RuleTester.InvalidTestCase[];
  },
): {
  valid: RuleTester.ValidTestCase[];
  invalid: RuleTester.InvalidTestCase[];
} {
  const validFixtureRoot = path.resolve(
    dirname,
    `../fixtures/rules/${ruleName}/valid/`,
  );
  const invalidFixtureRoot = path.resolve(
    dirname,
    `../fixtures/rules/${ruleName}/invalid/`,
  );

  const valid: (RuleTester.ValidTestCase | string)[] = listupInput(
    validFixtureRoot,
  ).map((inputFile) => getConfig(plugin, ruleName, inputFile));

  const fixable = plugin.rules![ruleName]!.meta?.fixable != null;

  const invalid: RuleTester.InvalidTestCase[] = listupInput(
    invalidFixtureRoot,
  ).map((inputFile) => {
    const config = getConfig(plugin, ruleName, inputFile);
    const errorFile = inputFile.replace(/input\.ya?ml$/u, "errors.json");
    const outputFile = inputFile.replace(/input\.ya?ml$/u, "output.yml");
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
  if (invalid.some((test) => test.output) && !options?.skipOutputTest) {
    // Filter before describe: vitest runs the callback after the
    // skipOutputTest flags are deleted below.
    const outputTests = invalid.filter(
      ({ filename, skipOutputTest }: any) =>
        isYaml(filename) && !skipOutputTest,
    );
    describe(`Output test for ${ruleName}`, () => {
      for (const test of outputTests) {
        it(test.filename || test.code, () => {
          const input = yamlESLintParser.parseForESLint(test.code);
          const output = yamlESLintParser.parseForESLint(
            test.output === null ? test.code : test.output!,
          );
          assert.deepStrictEqual(
            yamlESLintParser.getStaticYAMLValue(input.ast),
            yamlESLintParser.getStaticYAMLValue(output.ast),
          );
        });
      }
    });
  }
  for (const test of invalid) {
    delete (test as any).skipOutputTest;
  }

  return {
    valid: valid as RuleTester.ValidTestCase[],
    invalid,
  };
}

function listupInput(rootDir: string) {
  // A rule may have no valid/ or invalid/ directory: no cases.
  if (!fs.existsSync(rootDir)) {
    return [];
  }
  return [...itrListupInput(rootDir)];
}

function* itrListupInput(rootDir: string): IterableIterator<string> {
  for (const filename of fs.readdirSync(rootDir)) {
    if (filename.startsWith("_")) {
      // ignore
      continue;
    }
    const abs = path.join(rootDir, filename);
    if (filename.endsWith("input.yml") || filename.endsWith("input.yaml")) {
      yield abs;
    } else if (fs.statSync(abs).isDirectory()) {
      yield* itrListupInput(abs);
    }
  }
}

function getConfig(
  plugin: ESLint.Plugin,
  ruleName: string,
  inputFile: string,
): any {
  const baseConfig = Object.assign(
    {
      plugins: { yml: plugin },
    },
    isYaml(inputFile)
      ? {
          language: "yml/yaml",
        }
      : {},
  );

  const filename = toRuleRelativeName(inputFile, ruleName);

  const code0 = fs.readFileSync(inputFile, "utf8");
  const overrideConfigFile: string = inputFile.replace(
    /input\.ya?ml$/u,
    "override-config.json",
  );
  const overrideConfig = fs.existsSync(overrideConfigFile)
    ? JSON.parse(fs.readFileSync(overrideConfigFile, "utf8"))
    : {};
  let code, config;
  let configFile: string = inputFile.replace(/input\.ya?ml$/u, "config.json");
  if (!fs.existsSync(configFile)) {
    configFile = path.join(path.dirname(inputFile), "_config.json");
  }
  if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"));
  }
  if (config && typeof config === "object") {
    code = `# ${filename}\n${code0}`;
    return Object.assign(baseConfig, config, overrideConfig, {
      code,
      filename,
      name: filename,
    });
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

  return Object.assign(baseConfig, config, { code, filename });
}

function toRuleRelativeName(inputFile: string, ruleName: string) {
  const posixInputFile = inputFile.replace(/\\/gu, "/");
  return posixInputFile.slice(posixInputFile.indexOf(ruleName));
}

function isYaml(fileName: string) {
  return !fileName || fileName.endsWith(".yml") || fileName.endsWith(".yaml");
}
