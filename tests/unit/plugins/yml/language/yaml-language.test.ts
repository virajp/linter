// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/language/yaml-language.ts.
import assert from "node:assert";
import { Linter } from "eslint";
import { YAMLLanguage } from "../../../../../src/plugins/yml/language/index.js";
import { beforeEach, describe, it } from "vitest";

const plugin = { languages: { yaml: new YAMLLanguage() } };

/**
 * Creates a config array for testing.
 */
function createConfig(rules: Linter.RulesRecord = {}): Linter.Config[] {
  return [
    {
      files: ["**/*.yaml", "**/*.yml"],
      plugins: { yml: plugin },
      language: "yml/yaml",
      rules,
    },
  ];
}

describe("YAML Language", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("Normal", () => {
    it("should not have parse errors for valid YAML", () => {
      const code = `key: value`;
      const messages = linter.verify(code, createConfig(), "test.yaml");

      assert.deepStrictEqual(messages, []);
    });
  });

  describe("Errors", () => {
    it("should have parse errors for invalid YAML", () => {
      const code = `key: value:`;
      const messages = linter.verify(code, createConfig(), "test.yaml");

      assert.deepStrictEqual(messages, [
        {
          fatal: true,
          message:
            "Parsing error: Nested mappings are not allowed in compact mappings",
          line: 1,
          column: 5,
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
