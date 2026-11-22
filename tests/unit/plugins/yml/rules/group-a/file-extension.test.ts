// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/file-extension.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { YAMLLanguage } from "../../../../../../src/plugins/yml/language/index.js";
import { groupARules } from "../../../../../../src/plugins/yml/rules/group-a.js";
import rule from "../../../../../../src/plugins/yml/rules/file-extension.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const plugin = { rules: groupARules, languages: { yaml: new YAMLLanguage() } };

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("file-extension", rule, {
  valid: [
    {
      filename: "test.yaml",
      code: "a: b",
    },
    {
      filename: "test.yml",
      code: "a: b",
      options: [{ extension: "yml" }],
    },
    {
      filename: "test.yaml",
      code: "a: b",
      options: [{ extension: "yaml" }],
    },
    {
      filename: "test.YAML",
      code: "a: b",
      options: [{ extension: "yaml", caseSensitive: false }],
    },
  ],
  invalid: [
    {
      filename: "test.yml",
      code: "a: b",
      errors: ["Expected extension '.yaml' but used extension '.yml'."],
    },
    {
      filename: "test.yaml",
      code: "a: b",
      options: [{ extension: "yml" }],
      errors: ["Expected extension '.yml' but used extension '.yaml'."],
    },
    {
      filename: "test.yml",
      code: "a: b",
      options: [{ extension: "yaml" }],
      errors: ["Expected extension '.yaml' but used extension '.yml'."],
    },
    {
      filename: "test.YAML",
      code: "a: b",
      options: [{ extension: "yaml" }],
      errors: ["Expected extension '.yaml' but used extension '.YAML'."],
    },
  ],
});
