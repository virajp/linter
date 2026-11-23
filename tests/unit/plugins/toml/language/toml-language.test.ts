// Ported from eslint-plugin-toml v1.5.0 (MIT), tests/src/language/toml-language.ts.
import assert from "node:assert";
import { Linter } from "eslint";
import { TOMLLanguage } from "../../../../../src/plugins/toml/language/index.js";
import { beforeEach, describe, it } from "vitest";

const plugin = { languages: { toml: new TOMLLanguage() } };

/**
 * Creates a config array for testing.
 */
function createConfig(rules: Linter.RulesRecord = {}): Linter.Config[] {
  return [
    {
      files: ["**/*.toml"],
      plugins: { toml: plugin },
      language: "toml/toml",
      rules,
    },
  ];
}

describe("TOML Language", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("Normal", () => {
    it("should not have parse errors for valid TOML", () => {
      const code = `key = "value"`;
      const messages = linter.verify(code, createConfig(), "test.toml");

      assert.deepStrictEqual(messages, []);
    });
  });

  describe("Errors", () => {
    it("should have parse errors for invalid TOML", () => {
      const code = `key = "value`;
      const messages = linter.verify(code, createConfig(), "test.toml");

      assert.deepStrictEqual(messages, [
        {
          fatal: true,
          message: "Parsing error: Unterminated string constant",
          line: 1,
          column: 12,
          ruleId: null,
          severity: 2,
          ...(Linter.version.startsWith("9.")
            ? {
                nodeType: null,
              }
            : {}),
        },
      ]);
    });
  });
});
