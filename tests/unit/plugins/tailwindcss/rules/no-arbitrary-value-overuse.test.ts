// New test: @poupe/eslint-plugin-tailwindcss v0.3.1 has no test for src/rules/no-arbitrary-value-overuse.ts.
import css from "@eslint/css";
import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { groupARules } from "../../../../../src/plugins/tailwindcss/rules/group-a.js";
import { noArbitraryValueOveruse } from "../../../../../src/plugins/tailwindcss/rules/no-arbitrary-value-overuse.js";
import { tailwindSyntax } from "../../../../../src/plugins/tailwindcss/syntax.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  plugins: { css, tailwindcss: { rules: groupARules } },
  language: "css/css",
  languageOptions: { tolerant: true, customSyntax: tailwindSyntax },
} as never);

describe("no-arbitrary-value-overuse", () => {
  ruleTester.run("tailwindcss/no-arbitrary-value-overuse", noArbitraryValueOveruse as never, {
    valid: [
      { name: "plain CSS", code: ".a { color: red; }" },
      { name: "@apply with no arbitrary value", code: ".a { @apply p-4 text-red-500; }" },
      {
        name: "arbitrary values under the per-rule default (3) that need no token",
        code: ".a { @apply top-[13px] left-[2px] right-[3px]; }",
      },
      { name: "arbitrary value that is not a token pattern", code: ".a { @apply bg-[var(--x)]; }" },
      {
        name: "allowedUtilities skips the utility prefix",
        code: ".a { @apply top-[1px] top-[2px] top-[3px] top-[4px]; }",
        options: [{ allowedUtilities: ["top-"] }],
      },
      {
        name: "maxPerRule raised",
        code: ".a { @apply top-[1px] left-[2px] right-[3px] bottom-[4px]; }",
        options: [{ maxPerRule: 4 }],
      },
      {
        name: "maxPerFile at the limit",
        code: ".a { @apply top-[1px] left-[2px]; }\n.b { @apply top-[3px]; }",
        options: [{ maxPerFile: 3 }],
      },
    ],
    invalid: [
      {
        name: "considerThemeToken for a spacing value",
        code: ".a { @apply p-[13px]; }",
        errors: [{
          messageId: "considerThemeToken",
          data: { value: "[13px]" },
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 21,
        }],
      },
      {
        name: "considerThemeToken for a hex color",
        code: ".a { @apply bg-[#ff0000]; }",
        errors: [{ messageId: "considerThemeToken", data: { value: "[#ff0000]" }, line: 1, column: 13, endColumn: 25 }],
      },
      {
        name: "considerThemeToken with a variant modifier",
        code: ".a { @apply hover:bg-[#fff]; }",
        errors: [{ messageId: "considerThemeToken", data: { value: "[#fff]" }, line: 1, column: 13, endColumn: 28 }],
      },
      {
        name: "tooManyArbitraryValuesInRule with the default maxPerRule",
        code: ".a { @apply top-[1px] left-[2px] right-[3px] bottom-[4px]; }",
        errors: [{
          messageId: "tooManyArbitraryValuesInRule",
          data: { count: "4", max: "3" },
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 58,
        }],
      },
      {
        name: "tooManyArbitraryValuesInRule with maxPerRule",
        code: ".a { @apply top-[1px] left-[2px]; }",
        options: [{ maxPerRule: 1 }],
        errors: [{ messageId: "tooManyArbitraryValuesInRule", data: { count: "2", max: "1" }, line: 1, column: 13, endColumn: 33 }],
      },
      {
        name: "allowedUtilities does not skip other utilities",
        code: ".a { @apply top-[1px] left-[2px] right-[3px] bottom-[4px] inset-[5px]; }",
        options: [{ allowedUtilities: ["top-"] }],
        errors: [{ messageId: "tooManyArbitraryValuesInRule", data: { count: "4", max: "3" }, line: 1, column: 13 }],
      },
      {
        name: "tooManyArbitraryValues on the first @apply with maxPerFile",
        code: ".a { @apply top-[1px] left-[2px]; }\n.b { @apply top-[3px]; }",
        options: [{ maxPerFile: 2 }],
        errors: [{
          messageId: "tooManyArbitraryValues",
          data: { count: "3", max: "2" },
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 34,
        }],
      },
    ],
  });
});
