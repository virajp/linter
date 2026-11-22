// New test: @poupe/eslint-plugin-tailwindcss v0.3.1 has no test for src/rules/prefer-theme-tokens.ts.
import css from "@eslint/css";
import { RuleTester } from "eslint";
import { describe, it } from "vitest";

import { groupBRules } from "../../../../../src/plugins/tailwindcss/rules/group-b.js";
import { tailwindSyntax } from "../../../../../src/plugins/tailwindcss/syntax.js";
import { preferThemeTokens } from "../../../../../src/plugins/tailwindcss/rules/prefer-theme-tokens.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

// The config of the css preset.
const ruleTester = new RuleTester({
  plugins: { css, tailwindcss: { rules: groupBRules } },
  language: "css/css",
  languageOptions: { tolerant: true, customSyntax: tailwindSyntax },
});

describe("prefer-theme-tokens", () => {
  ruleTester.run("tailwindcss/prefer-theme-tokens", preferThemeTokens, {
    valid: [
      // Values that use theme tokens
      ".a { color: theme(\"colors.primary\"); }",
      ".a { color: var(--color-primary); }",
      ".a { padding: var(--spacing-4); }",
      // Values that are not colors or lengths
      ".a { color: inherit; }",
      ".a { margin: 0; }",
      ".a { width: auto; }",
      // Properties outside the default categories (colors, spacing, sizing)
      ".a { font-size: 16px; }",
      ".a { border-radius: 4px; }",
      ".a { opacity: 0.5; }",
      // Properties with no category
      ".a { top: 10px; }",
      // Theme variables are not reported
      "@theme { --color-primary: #0066cc; --spacing-4: 1rem; }",
      // Ignored properties
      {
        code: ".a { color: red; }",
        options: [{ ignoreProperties: ["color"] }],
      },
      // Disabled categories
      {
        code: ".a { color: red; padding: 1rem; }",
        options: [{ categories: ["sizing"] }],
      },
    ],

    invalid: [
      {
        code: ".a { color: #fff; }",
        errors: [{
          messageId: "useThemeToken",
          data: { value: "#fff", property: "color" },
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 17,
        }],
      },
      {
        code: ".a { background-color: rgba(0, 0, 0, 0.5); }",
        errors: [{
          messageId: "useThemeToken",
          data: { value: "rgba(0, 0, 0, 0.5)", property: "background-color" },
        }],
      },
      {
        code: ".a { border-color: hsl(0 0% 0%); }",
        errors: [{
          messageId: "useThemeToken",
          data: { value: "hsl(0 0% 0%)", property: "border-color" },
        }],
      },
      {
        code: ".a { color: Red; }",
        errors: [{
          messageId: "useThemeToken",
          data: { value: "Red", property: "color" },
        }],
      },
      {
        code: ".a { padding: 1rem; margin-top: -8px; gap: 2em; }",
        errors: [
          {
            messageId: "useThemeToken",
            data: { value: "1rem", property: "padding" },
          },
          {
            messageId: "useThemeToken",
            data: { value: "-8px", property: "margin-top" },
          },
          {
            messageId: "useThemeToken",
            data: { value: "2em", property: "gap" },
          },
        ],
      },
      {
        code: ".a { width: 50%; max-height: 100vh; }",
        errors: [
          {
            messageId: "useThemeToken",
            data: { value: "50%", property: "width" },
          },
          {
            messageId: "useThemeToken",
            data: { value: "100vh", property: "max-height" },
          },
        ],
      },
      // A theme variable with the same value: fix to theme()
      {
        code: "@theme { --color-primary: #0066cc; }\n.a { color: #0066cc; }",
        errors: [{
          messageId: "useThemeTokenWithSuggestion",
          data: {
            value: "#0066cc",
            property: "color",
            suggestion: "color.primary",
          },
          line: 2,
          column: 13,
          endLine: 2,
          endColumn: 20,
        }],
        output: "@theme { --color-primary: #0066cc; }\n.a { color: theme(\"color.primary\"); }",
      },
      {
        code: "@theme { --spacing-4: 1rem; }\n.a { padding: 1rem; }",
        errors: [{
          messageId: "useThemeTokenWithSuggestion",
          data: {
            value: "1rem",
            property: "padding",
            suggestion: "spacing.4",
          },
        }],
        output: "@theme { --spacing-4: 1rem; }\n.a { padding: theme(\"spacing.4\"); }",
      },
      // A theme variable of another category is not a match
      {
        code: "@theme { --spacing-4: 1rem; }\n.a { width: 1rem; }",
        errors: [{
          messageId: "useThemeToken",
          data: { value: "1rem", property: "width" },
        }],
      },
      // An enabled category outside the defaults
      {
        code: ".a { font-size: 16px; }",
        options: [{ categories: ["typography"] }],
        errors: [{
          messageId: "useThemeToken",
          data: { value: "16px", property: "font-size" },
        }],
      },
      {
        code: ".a { color: red; padding: 1rem; }",
        options: [{ categories: ["spacing"] }],
        errors: [{
          messageId: "useThemeToken",
          data: { value: "1rem", property: "padding" },
        }],
      },
      // ignoreProperties replaces the default list
      {
        code: ".a { color: red; padding: 1rem; }",
        options: [{ ignoreProperties: ["padding"] }],
        errors: [{
          messageId: "useThemeToken",
          data: { value: "red", property: "color" },
        }],
      },
    ],
  });
});
