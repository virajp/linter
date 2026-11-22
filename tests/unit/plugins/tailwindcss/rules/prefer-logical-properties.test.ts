// New test: @poupe/eslint-plugin-tailwindcss v0.3.1 has no test for src/rules/prefer-logical-properties.ts.
import css from "@eslint/css";
import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { groupBRules } from "../../../../../src/plugins/tailwindcss/rules/group-b.js";
import { tailwindSyntax } from "../../../../../src/plugins/tailwindcss/syntax.js";
import { preferLogicalProperties } from "../../../../../src/plugins/tailwindcss/rules/prefer-logical-properties.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

// The config of the css preset.
const ruleTester = new RuleTester({
  plugins: { css, tailwindcss: { rules: groupBRules } },
  language: "css/css",
  languageOptions: { tolerant: true, customSyntax: tailwindSyntax },
});

describe("prefer-logical-properties", () => {
  ruleTester.run("tailwindcss/prefer-logical-properties", preferLogicalProperties, {
    valid: [
      ".a { margin-inline-start: 1rem; }",
      ".a { inset-block-start: 0; }",
      ".a { text-align: start; }",
      ".a { block-size: 10vb; }",
      ".a { text-align: center; }",
      // A declaration inside @supports is not reported
      "@supports (margin-left: 0) { .a { color: red; } }",
      {
        code: ".a { margin-left: 1rem; }",
        options: [{ allowProperties: ["margin-left"] }],
      },
      {
        code: ".a { block-size: 10vh; }",
        options: [{ allowUnits: ["vh"] }],
      },
    ],

    invalid: [
      {
        code: ".a { margin-left: 1rem; }",
        errors: [{
          messageId: "notLogicalProperty",
          data: { property: "margin-left", replacement: "margin-inline-start" },
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 23,
          suggestions: [{
            messageId: "replaceWithLogicalProperty",
            data: { property: "margin-left", replacement: "margin-inline-start" },
            output: ".a { margin-inline-start: 1rem; }",
          }],
        }],
      },
      {
        code: ".a { width: 10rem; }",
        errors: [{
          messageId: "notLogicalProperty",
          data: { property: "width", replacement: "inline-size" },
          suggestions: [{
            messageId: "replaceWithLogicalProperty",
            data: { property: "width", replacement: "inline-size" },
            output: ".a { inline-size: 10rem; }",
          }],
        }],
      },
      {
        code: ".a { text-align: left; }",
        errors: [{
          messageId: "notLogicalValue",
          data: { value: "left", replacement: "start" },
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 22,
          suggestions: [{
            messageId: "replaceWithLogicalValue",
            data: { value: "left", replacement: "start" },
            output: ".a { text-align: start; }",
          }],
        }],
      },
      {
        code: ".a { float: right; }",
        errors: [{
          messageId: "notLogicalValue",
          data: { value: "right", replacement: "inline-end" },
          suggestions: [{
            messageId: "replaceWithLogicalValue",
            data: { value: "right", replacement: "inline-end" },
            output: ".a { float: inline-end; }",
          }],
        }],
      },
      {
        code: ".a { block-size: 10vh; }",
        errors: [{
          messageId: "notLogicalUnit",
          data: { unit: "vh", replacement: "vb" },
          line: 1,
          column: 18,
          endLine: 1,
          endColumn: 22,
          suggestions: [{
            messageId: "replaceWithLogicalUnit",
            data: { unit: "vh", replacement: "vb" },
            output: ".a { block-size: 10vb; }",
          }],
        }],
      },
      {
        // allowUnits does not allow a property
        code: ".a { height: 10vb; }",
        options: [{ allowUnits: ["vh"] }],
        errors: [{
          messageId: "notLogicalProperty",
          data: { property: "height", replacement: "block-size" },
          suggestions: [{
            messageId: "replaceWithLogicalProperty",
            data: { property: "height", replacement: "block-size" },
            output: ".a { block-size: 10vb; }",
          }],
        }],
      },
      {
        // allowProperties does not allow a unit
        code: ".a { height: 10vh; }",
        options: [{ allowProperties: ["height"] }],
        errors: [{
          messageId: "notLogicalUnit",
          data: { unit: "vh", replacement: "vb" },
          suggestions: [{
            messageId: "replaceWithLogicalUnit",
            data: { unit: "vh", replacement: "vb" },
            output: ".a { height: 10vb; }",
          }],
        }],
      },
    ],
  });
});
