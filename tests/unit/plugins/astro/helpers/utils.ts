// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/utils/utils.ts.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ESLint, RuleTester } from "eslint"
import * as astroESLintParser from "astro-eslint-parser"

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 */
export function unIndent(strings: readonly string[]): string {
  const templateValue = strings[0]!
  const lines = templateValue.split("\n")
  const minLineIndent = getMinIndent(lines)

  return lines.map((line) => line.slice(minLineIndent)).join("\n")
}

/**
 * for `code` and `output`
 */
export function unIndentCodeAndOutput([code]: readonly string[]): (
  args: readonly string[],
) => {
  code: string
  output: string
} {
  const codeLines = code!.split("\n")
  const codeMinLineIndent = getMinIndent(codeLines)

  return ([output]: readonly string[]) => {
    const outputLines = output!.split("\n")
    const minLineIndent = Math.min(getMinIndent(outputLines), codeMinLineIndent)

    return {
      code: codeLines.map((line) => line.slice(minLineIndent)).join("\n"),
      output: outputLines.map((line) => line.slice(minLineIndent)).join("\n"),
    }
  }
}

/**
 * Get number of minimum indent
 */
function getMinIndent(lines: string[]) {
  const lineIndents = lines
    .filter((line) => line.trim())
    .map((line) => / */u.exec(line)![0].length)
  return Math.min(...lineIndents)
}

/**
 * Load test cases
 */
export function loadTestCases(
  ruleName: string,
  plugin: ESLint.Plugin,
  options?: {
    additionals?: {
      valid?: (RuleTester.ValidTestCase | string)[]
      invalid?: RuleTester.InvalidTestCase[]
    }
    filter: (file: string) => boolean
  },
): {
  valid: RuleTester.ValidTestCase[]
  invalid: RuleTester.InvalidTestCase[]
} {
  const validFixtureRoot = path.resolve(
    dirname,
    `../fixtures/rules/${ruleName}/valid/`,
  )
  const invalidFixtureRoot = path.resolve(
    dirname,
    `../fixtures/rules/${ruleName}/invalid/`,
  )

  const filter = options?.filter ?? (() => true)

  const valid: (RuleTester.ValidTestCase | string)[] = listupInput(
    validFixtureRoot,
  )
    .filter((file) => !path.basename(file).startsWith("_"))
    .filter(filter)
    .map((inputFile) => getConfig(ruleName, inputFile))

  const fixable = plugin.rules![ruleName]!.meta!.fixable != null

  const invalid: RuleTester.InvalidTestCase[] = listupInput(invalidFixtureRoot)
    .filter((file) => !path.basename(file).startsWith("_"))
    .filter(filter)
    .map((inputFile) => {
      const config = getConfig(ruleName, inputFile)
      const errorFile = inputFile.replace(/input\.astro$/u, "errors.json")
      const outputFile = inputFile.replace(/input\.astro$/u, "output.astro")
      // A missing errors.json or output file fails the test: the loader
      // never writes a fixture.
      const errors = fs.readFileSync(errorFile, "utf8")
      config.errors = JSON.parse(errors)
      if (fixable) {
        const output = fs.readFileSync(outputFile, "utf8")
        config.output = output === config.code ? null : output
      }

      return config
    })

  if (options?.additionals) {
    if (options.additionals.valid) {
      valid.push(...options.additionals.valid)
    }
    if (options.additionals.invalid) {
      invalid.push(...options.additionals.invalid)
    }
  }
  for (const test of valid) {
    if (!(test as RuleTester.ValidTestCase).code) {
      throw new Error(`Empty code: ${(test as RuleTester.ValidTestCase).filename}`)
    }
  }
  for (const test of invalid) {
    if (!test.code) {
      throw new Error(`Empty code: ${test.filename}`)
    }
  }
  return {
    valid: valid as RuleTester.ValidTestCase[],
    invalid,
  }
}

function listupInput(rootDir: string) {
  return [...itrListupInput(rootDir)]
}

function* itrListupInput(rootDir: string): IterableIterator<string> {
  for (const filename of fs.readdirSync(rootDir)) {
    if (filename.startsWith("_")) {
      // ignore
      continue
    }
    const abs = path.join(rootDir, filename)
    if (filename.endsWith("input.astro")) {
      yield abs
    } else if (fs.statSync(abs).isDirectory()) {
      yield* itrListupInput(abs)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test case config
function getConfig(ruleName: string, inputFile: string): any {
  const filename = inputFile.slice(inputFile.indexOf(ruleName))
  const code = fs.readFileSync(inputFile, "utf8")
  let config
  let configFile: string = inputFile.replace(/input\.astro$/u, "config.json")
  if (!fs.existsSync(configFile)) {
    configFile = path.join(path.dirname(inputFile), "_config.json")
  }
  if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"))
  }
  if (config && typeof config === "object") {
    return Object.assign(
      {},
      config,
      {
        languageOptions: {
          parser: astroESLintParser,
          ...config?.languageOptions,
        },
      },
      { code, filename },
    )
  }
  // default
  return Object.assign(
    { languageOptions: { parser: astroESLintParser } },
    { code, filename },
  )
}
