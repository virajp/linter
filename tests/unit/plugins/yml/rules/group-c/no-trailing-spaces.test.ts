// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/no-trailing-spaces.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../../../../../../src/plugins/yml/rules/no-trailing-spaces.js";
import { groupCRules } from "../../../../../../src/plugins/yml/rules/group-c.js";
import { YAMLLanguage } from "../../../../../../src/plugins/yml/language/index.js";
import { loadTestCases } from "../../helpers/utils.js";

const plugin = {
  rules: groupCRules,
  languages: { yaml: new YAMLLanguage() },
};

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});
const trailingSpaces = "   ";
const trailingTabAndSpace = "\t ";

const error = {
  message: "Trailing spaces not allowed.",
};

tester.run(
  "no-trailing-spaces",
  rule,
  loadTestCases(
    "no-trailing-spaces",
    plugin,
    {},
    {
      valid: [
        {
          code: `# comment${trailingSpaces}
key: value
inline: value # comment${trailingTabAndSpace}
`,
          options: [{ ignoreComments: true }],
        },
        {
          code: `key: value
${trailingSpaces}
next: value
`,
          options: [{ skipBlankLines: true }],
        },
        {
          code: `block: |
  keep${trailingSpaces}
  value
`,
        },
      ],
      invalid: [
        {
          code: `# comment${trailingSpaces}
key: value${trailingSpaces}
`,
          output: `# comment
key: value
`,
          errors: [
            {
              ...error,
              line: 1,
              column: 10,
            },
            {
              ...error,
              line: 2,
              column: 11,
            },
          ],
        },
        {
          code: `# comment${trailingSpaces}
key: value${trailingSpaces}
inline: value # comment${trailingSpaces}
`,
          output: `# comment${trailingSpaces}
key: value
inline: value # comment${trailingSpaces}
`,
          options: [{ ignoreComments: true }],
          errors: [
            {
              ...error,
              line: 2,
              column: 11,
            },
          ],
        },
        {
          code: `key: value
${trailingSpaces}
next: value${trailingSpaces}
`,
          output: `key: value
${trailingSpaces}
next: value
`,
          options: [{ skipBlankLines: true }],
          errors: [
            {
              ...error,
              line: 3,
              column: 12,
            },
          ],
        },
      ],
    },
  ),
);
