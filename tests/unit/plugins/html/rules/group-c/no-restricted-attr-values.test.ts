// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-restricted-attr-values.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/no-restricted-attr-values.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-restricted-attr-values", rule, {
  valid: [
    {
      code: `<div> </div>`,
      options: [
        {
          attrPatterns: [".*"],
          attrValuePatterns: ["data-.*"],
        },
      ],
    },
    {
      code: `<div class="foo"> </div>`,
      options: [
        {
          attrPatterns: ["class"],
          attrValuePatterns: ["data-.*"],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `<div foo="data-x"> </div>`,
      options: [
        {
          attrPatterns: [".*"],
          attrValuePatterns: ["data-.*"],
        },
      ],
      errors: [
        {
          messageId: "restricted",
          line: 1,
          column: 11,
          data: {
            attrValuePatterns: "data-x",
          },
        },
      ],
    },
    {
      code: `<div foo=""> </div>`,
      options: [
        {
          attrPatterns: [".*"],
          attrValuePatterns: [""],
        },
      ],
      errors: [
        {
          messageId: "restricted",
          line: 1,
          column: 11,
          data: {
            attrValuePatterns: "",
          },
        },
      ],
    },
    {
      code: `<div class="foo"> </div> <a alt="foo"></a>`,
      options: [
        {
          attrPatterns: ["alt"],
          attrValuePatterns: ["foo"],
        },
      ],
      errors: [
        {
          messageId: "restricted",
          line: 1,
          column: 34,
          data: {
            attrValuePatterns: "foo",
          },
        },
      ],
    },
    {
      code: `<div alt="foo"> </div> <custom-element class="foo"></custom-element>`,
      options: [
        {
          attrPatterns: ["alt", "class"],
          attrValuePatterns: ["^foo$"],
          message: "no foo for alt or class",
        },
      ],
      errors: [
        {
          message: "no foo for alt or class",
          line: 1,
          column: 11,
        },
        {
          message: "no foo for alt or class",
          line: 1,
          column: 47,
        },
      ],
    },
    // custom message
    {
      code: `<div foo="data-x"> </div>`,
      options: [
        {
          attrPatterns: [".*"],
          attrValuePatterns: ["data.*"],
          message: "please do not use 'data-x'",
        },
      ],
      errors: [
        {
          message: "please do not use 'data-x'",
          line: 1,
          column: 11,
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-restricted-attr-values", rule, {
  valid: [
    {
      code: `html\`<div> </div>\``,
      options: [
        {
          attrPatterns: [".*"],
          attrValuePatterns: ["data-.*"],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `html\`<div alt="foo"> </div> <custom-element class="foo"></custom-element>\``,
      options: [
        {
          attrPatterns: ["alt", "class"],
          attrValuePatterns: ["^foo$"],
          message: "no foo for alt or class",
        },
      ],
      errors: [
        {
          message: "no foo for alt or class",
          line: 1,
          column: 16,
        },
        {
          message: "no foo for alt or class",
          line: 1,
          column: 52,
        },
      ],
    },
  ],
});
