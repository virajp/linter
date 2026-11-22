// New test: @poupe/eslint-plugin-tailwindcss v0.3.1 has no test for src/rules/relative-font-units.ts.
import css from "@eslint/css";
import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { groupBRules } from "../../../../../src/plugins/tailwindcss/rules/group-b.js";
import { tailwindSyntax } from "../../../../../src/plugins/tailwindcss/syntax.js";
import { relativeFontUnits } from "../../../../../src/plugins/tailwindcss/rules/relative-font-units.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

// The config of the css preset.
const ruleTester = new RuleTester({
  plugins: { css, tailwindcss: { rules: groupBRules } },
  language: "css/css",
  languageOptions: { tolerant: true, customSyntax: tailwindSyntax },
});

describe("relative-font-units", () => {
  ruleTester.run("tailwindcss/relative-font-units", relativeFontUnits, {
    valid: [
      ".a { font-size: 1rem; }",
      ".a { font-size: 1.25REM; }",
      ".a { font: italic 1rem/150% serif; }",
      ".a { font: 1rem/1.5 sans-serif; }",
      ".a { line-height: 16px; }",
      {
        code: ".a { font-size: 1em; }",
        options: [{ allowUnits: ["em", "%"] }],
      },
      {
        code: ".a { font-size: 50%; }",
        options: [{ allowUnits: ["em", "%"] }],
      },
      {
        code: ".a { font: 120% serif; }",
        options: [{ allowUnits: ["%"] }],
      },
    ],

    invalid: [
      {
        code: ".a { font-size: 16px; }",
        errors: [{
          messageId: "allowedFontUnits",
          data: { allowedFontUnits: "rem" },
          line: 1,
          column: 17,
          endLine: 1,
          endColumn: 21,
        }],
      },
      {
        code: ".a { font-size: small; }",
        errors: [{
          messageId: "allowedFontUnits",
          data: { allowedFontUnits: "rem" },
          line: 1,
          column: 17,
          endLine: 1,
          endColumn: 22,
        }],
      },
      {
        code: ".a { font-size: 50%; }",
        errors: [{
          messageId: "allowedFontUnits",
          data: { allowedFontUnits: "rem" },
        }],
      },
      {
        code: ".a { font-size: 1rem; }",
        options: [{ allowUnits: ["em", "%"] }],
        errors: [{
          messageId: "allowedFontUnits",
          data: { allowedFontUnits: "em, %" },
        }],
      },
      {
        code: ".a { font: 16px/1.5 sans-serif; }",
        errors: [{
          messageId: "allowedFontUnits",
          data: { allowedFontUnits: "rem" },
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 16,
        }],
      },
      {
        code: ".a { font: large serif; }",
        errors: [{
          messageId: "allowedFontUnits",
          data: { allowedFontUnits: "rem" },
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 17,
        }],
      },
      {
        code: ".a { font: 120% serif; }",
        errors: [{
          messageId: "allowedFontUnits",
          data: { allowedFontUnits: "rem" },
          line: 1,
          column: 12,
          endLine: 1,
          endColumn: 16,
        }],
      },
    ],
  });
});
