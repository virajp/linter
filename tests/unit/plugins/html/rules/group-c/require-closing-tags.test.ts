// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-closing-tags.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/require-closing-tags.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-closing-tags", rule, {
  valid: [
    {
      code: `<div></div>`,
    },
    {
      code: `<img>`,
    },
    {
      code: `<script></script>`,
    },
    {
      code: `<style></style>`,
    },
    {
      code: `<img/>`,
      options: [
        {
          selfClosing: "always",
        },
      ],
    },
    {
      code: `<custom-tag> </custom-tag>`,
      options: [
        {
          selfClosingCustomPatterns: [],
        },
      ],
    },
    {
      code: `<custom-tag/>`,
      options: [
        {
          selfClosingCustomPatterns: ["-"],
        },
      ],
    },
    {
      code: `<custom-tag />`,
      options: [
        {
          selfClosingCustomPatterns: ["-"],
        },
      ],
    },
    {
      code: `<custom-tag> </custom-tag>`,
      options: [
        {
          selfClosingCustomPatterns: ["-"],
        },
      ],
    },
    {
      code: `<custom-tag id="foo" />`,
      options: [
        {
          selfClosingCustomPatterns: ["-"],
        },
      ],
    },
    {
      code: `<custom-tag>children</custom-tag>`,
      options: [
        {
          selfClosingCustomPatterns: ["-"],
        },
      ],
    },
    {
      code: `
    <body>
      <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
		  <circle> </circle>
</svg>
    </body>
`,
    },
    {
      code: `
    <body>
      <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
		  <circle />
</svg>
    </body>
`,
      options: [
        {
          selfClosing: "always",
        },
      ],
    },
    {
      code: `
    <body>
      <math>
        1<mspace width="100px" />2
      </math>
    </body>
`,
      options: [
        {
          selfClosing: "always",
        },
      ],
    },
    // https://github.com/yeonjuan/html-eslint/issues/73
    {
      code: `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="myGradient" gradientTransform="rotate(90)">
</linearGradient>
</defs>
</svg>
</body>
</html>
`,
    },
  ],
  invalid: [
    {
      code: `<div>`,
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      code: `<img>`,
      output: `<img />`,
      options: [
        {
          selfClosing: "always",
        },
      ],
      errors: [
        {
          messageId: "missingSelf",
        },
      ],
    },
    {
      code: `<img />`,
      output: `<img >`,
      options: [
        {
          selfClosing: "never",
        },
      ],
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<custom-tag />`,
      options: [
        {
          selfClosingCustomPatterns: [],
        },
      ],
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<custom-tag id="foo" />`,
      options: [
        {
          selfClosingCustomPatterns: [],
        },
      ],
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<custom-tag></custom-tag>`,
      options: [
        {
          selfClosingCustomPatterns: ["-"],
        },
      ],
      output: "<custom-tag />",
      errors: [
        {
          messageId: "missingSelf",
        },
      ],
    },
    {
      code: `<div />`,
      options: [
        {
          selfClosing: "always",
        },
      ],
      output: null,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<script>`,
      errors: [{ messageId: "missing" }],
    },
    {
      code: `<style>`,
      errors: [{ messageId: "missing" }],
    },
  ],
});

templateRuleTester.run("[template] require-closing-tags", rule, {
  valid: [
    {
      code: "html`<div></div>`",
    },
  ],
  invalid: [
    {
      code: "html`<div>`",
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
  ],
});
