// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/css-no-empty-blocks.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/css-no-empty-blocks.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);

/**
 * Based on
 * https://github.com/eslint/css/blob/main/tests/rules/no-empty-blocks.test.js
 */



ruleTester.run("css-no-empty-blocks", rule, {
  valid: [
    {
      code: "<style> a { color: red; } </style>",
    },
  ],
  invalid: [
    {
      code: "<style>a { }</style>",
      errors: [
        {
          messageId: "emptyBlock",
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 13,
        },
      ],
    },
    {
      code: "<style>a { /* comment */ }</style>",
      errors: [
        {
          messageId: "emptyBlock",
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 27,
        },
      ],
    },
    {
      code: "<style>a {\n}</style>",
      errors: [
        {
          messageId: "emptyBlock",
          line: 1,
          column: 10,
          endLine: 2,
          endColumn: 2,
        },
      ],
    },
    {
      code: "<style>a { \n }</style>",
      errors: [
        {
          messageId: "emptyBlock",
          line: 1,
          column: 10,
          endLine: 2,
          endColumn: 3,
        },
      ],
    },
    {
      code: `<style>
 a { }
</style>`,
      errors: [
        {
          messageId: "emptyBlock",
          line: 2,
          column: 4,
          endLine: 2,
          endColumn: 7,
        },
      ],
    },
    {
      code: "<style>@media print { }</style>",
      errors: [
        {
          messageId: "emptyBlock",
          line: 1,
          column: 21,
          endLine: 1,
          endColumn: 24,
        },
      ],
    },
    {
      code: "<style>a { }\n@media print { \nb { } \n}</style>",
      errors: [
        {
          messageId: "emptyBlock",
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 13,
        },
        {
          messageId: "emptyBlock",
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 6,
        },
      ],
    },
  ],
});
