// New test: @poupe/eslint-plugin-tailwindcss v0.3.1 has no test for src/rules/use-layers.ts.
import css from "@eslint/css";
import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { groupBRules } from "../../../../../src/plugins/tailwindcss/rules/group-b.js";
import { tailwindSyntax } from "../../../../../src/plugins/tailwindcss/syntax.js";
import { useLayers } from "../../../../../src/plugins/tailwindcss/rules/use-layers.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

// The config of the css preset.
const ruleTester = new RuleTester({
  plugins: { css, tailwindcss: { rules: groupBRules } },
  language: "css/css",
  languageOptions: { tolerant: true, customSyntax: tailwindSyntax },
});

describe("use-layers", () => {
  ruleTester.run("tailwindcss/use-layers", useLayers, {
    valid: [
      "@layer base { .a { color: red; } }",
      "@layer base { @layer components { .a { color: red; } } }",
      "@layer base, components;",
      "@import url(\"theme.css\") layer(base);",
      {
        code: "@layer { .a { color: red; } }",
        options: [{ allowUnnamedLayers: true }],
      },
      {
        code: "@import url(\"theme.css\") layer;",
        options: [{ allowUnnamedLayers: true }],
      },
      {
        code: "@import url(\"theme.css\");",
        options: [{ requireImportLayers: false }],
      },
      {
        code: "@layer base.components { .a { color: red; } }",
        options: [{ layerNamePattern: "^[a-z]+$" }],
      },
    ],

    invalid: [
      {
        code: ".a { color: red; }",
        errors: [{
          messageId: "missingLayer",
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 19,
        }],
      },
      {
        code: "@layer base { .a { color: red; } }\n.b { color: blue; }",
        errors: [{
          messageId: "missingLayer",
          line: 2,
          column: 1,
        }],
      },
      {
        code: "@layer { .a { color: red; } }",
        errors: [{
          messageId: "missingLayerName",
          line: 1,
          column: 1,
        }],
      },
      {
        code: "@import url(\"theme.css\");",
        errors: [{
          messageId: "missingImportLayer",
          line: 1,
          column: 1,
        }],
      },
      {
        code: "@import url(\"theme.css\") layer;",
        errors: [{
          messageId: "missingLayerName",
          line: 1,
          column: 26,
          endLine: 1,
          endColumn: 31,
        }],
      },
      {
        code: "@layer Base { .a { color: red; } }",
        options: [{ layerNamePattern: "^[a-z]+$" }],
        errors: [{
          messageId: "layerNameMismatch",
          data: { name: "Base", pattern: "^[a-z]+$" },
          line: 1,
          column: 8,
          endLine: 1,
          endColumn: 12,
        }],
      },
      {
        code: "@layer base.Components { .a { color: red; } }",
        options: [{ layerNamePattern: "^[a-z]+$" }],
        errors: [{
          messageId: "layerNameMismatch",
          data: { name: "Components", pattern: "^[a-z]+$" },
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 23,
        }],
      },
    ],
  });
});
