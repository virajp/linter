// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/key-name-casing.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../../../../../../src/plugins/yml/rules/key-name-casing.js";
import { groupBRules } from "../../../../../../src/plugins/yml/rules/group-b.js";
import { YAMLLanguage } from "../../../../../../src/plugins/yml/language/index.js";

const plugin = {
  rules: groupBRules,
  languages: { yaml: new YAMLLanguage() },
};

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run("key-name-casing", rule, {
  valid: [
    '{"key": "value"}',
    '{"camelCase": "value"}',
    '"PascalCase"',
    '"string"',
    '["element"]',
    {
      code: `
            {
                "foo.bar": "value",
            }`,
      options: [{ ignores: ["^[a-z\\.]+$"] }],
    },
  ],
  invalid: [
    {
      code: `
            {
                "camelCase": "camelCaseValue",
                "PascalCase": "PascalCaseValue",
                "SCREAMING_SNAKE_CASE": "SCREAMING_SNAKE_CASE_VALUE",
                "kebab-case": "kebab-case-value",
                "snake_case": "snake_case_value",
                "Mixed-Case": "Mixed-Case-Value",
                "foo.bar": "value",
            }`,
      errors: [
        "Key name `PascalCase` must match one of the following formats: camelCase",
        "Key name `SCREAMING_SNAKE_CASE` must match one of the following formats: camelCase",
        "Key name `kebab-case` must match one of the following formats: camelCase",
        "Key name `snake_case` must match one of the following formats: camelCase",
        "Key name `Mixed-Case` must match one of the following formats: camelCase",
        "Key name `foo.bar` must match one of the following formats: camelCase",
      ],
    },
    {
      code: `
            {
                camelCase: "camelCaseValue",
                PascalCase: "PascalCaseValue",
                SCREAMING_SNAKE_CASE: "SCREAMING_SNAKE_CASE_VALUE",
                snake_case: "snake_case_value",
            }`,
      errors: [
        "Key name `PascalCase` must match one of the following formats: camelCase",
        "Key name `SCREAMING_SNAKE_CASE` must match one of the following formats: camelCase",
        "Key name `snake_case` must match one of the following formats: camelCase",
      ],
    },
    {
      code: `
            {
                "camelCase": "camelCaseValue",
                "PascalCase": "PascalCaseValue",
                "SCREAMING_SNAKE_CASE": "SCREAMING_SNAKE_CASE_VALUE",
                "kebab-case": "kebab-case-value",
                "snake_case": "snake_case_value",
                "Mixed-Case": "Mixed-Case-Value",
            }`,
      options: [
        {
          camelCase: true,
          "kebab-case": true,
          PascalCase: true,
          snake_case: true,
          SCREAMING_SNAKE_CASE: true,
        },
      ],
      errors: [
        "Key name `Mixed-Case` must match one of the following formats: camelCase, kebab-case, PascalCase, snake_case, SCREAMING_SNAKE_CASE",
      ],
    },
  ],
});
