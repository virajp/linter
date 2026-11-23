// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rule-tester.js.
import { RuleTester as ESLintRuleTester } from "eslint";
import type { ESLint, Linter, Rule } from "eslint";
import { describe, it } from "vitest";
import type { RuleModule } from "../../../../../src/plugins/html/types/index.js";

ESLintRuleTester.describe = describe;
ESLintRuleTester.it = it;
ESLintRuleTester.itOnly = it.only;

const FILE_NAME = "test.html";

function getLanguageOptions(
  test: ESLintRuleTester.InvalidTestCase | ESLintRuleTester.ValidTestCase,
) {
  if (!test.languageOptions) {
    return {};
  }

  return test.languageOptions && test.languageOptions.parserOptions
    ? test.languageOptions.parserOptions
    : {};
}

class RuleTester extends ESLintRuleTester {
  constructor(options: Linter.Config) {
    super(options);
  }

  // @ts-expect-error -- the rule type differs from ESLint's, as upstream.
  override run(
    name: string,
    rule: RuleModule<any[]>,
    tests: {
      valid: ESLintRuleTester.ValidTestCase[];
      invalid: ESLintRuleTester.InvalidTestCase[];
    },
  ) {
    super.run(name, rule as unknown as Rule.RuleModule, {
      valid: tests.valid.map((test) => {
        return {
          ...test,
          languageOptions: getLanguageOptions(test),
          filename: FILE_NAME,
        };
      }),
      invalid: tests.invalid.map((test) => ({
        ...test,
        languageOptions: getLanguageOptions(test),
        filename: FILE_NAME,
      })),
    });
  }
}

export function createRuleTester(
  plugin: ESLint.Plugin,
  parser?: "espree",
): RuleTester {
  if (!parser) {
    return new RuleTester({
      plugins: {
        html: plugin,
      },
      language: "html/html",
    });
  }
  return new RuleTester({
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2015,
      },
    },
  });
}
