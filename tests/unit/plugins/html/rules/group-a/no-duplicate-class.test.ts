// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-duplicate-class.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/no-duplicate-class.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-duplicate-class", rule, {
  valid: [
    {
      code: `<button class></button>`,
    },
    {
      code: `<button class=foo></button>`,
    },
    {
      code: `<button class="foo"></button>`,
    },
    {
      code: `<button class="foo foofoo"></button>`,
    },
    {
      code: `<button id="foo foo"></button>`,
    },
  ],
  invalid: [
    {
      code: `<button class="foo foo"></button>`,
      output: `<button class="foo "></button>`,
      errors: [
        {
          messageId: "duplicateClass",
          column: 20,
          endColumn: 23,
        },
      ],
    },
    {
      code: `<button class="foo   foo"></button>`,
      output: `<button class="foo   "></button>`,
      errors: [
        {
          messageId: "duplicateClass",
          column: 22,
          endColumn: 25,
        },
      ],
    },
    {
      code: `<button class="foo bar foo"></button>`,
      output: `<button class="foo bar "></button>`,
      errors: [
        {
          messageId: "duplicateClass",
        },
      ],
    },
    {
      code: `<button class="foo foo bar"></button>`,
      output: `<button class="foo  bar"></button>`,
      errors: [
        {
          messageId: "duplicateClass",
        },
      ],
    },
    {
      code: `<button class=" foo foo bar "></button>`,
      output: `<button class=" foo  bar "></button>`,
      errors: [
        {
          messageId: "duplicateClass",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-duplicate class", rule, {
  valid: [
    {
      code: "html`<div class='foo'></div>`",
    },
    {
      code: "html`<div class=${' foo foo foo '}></div>`",
    },
  ],
  invalid: [
    {
      code: `
      html\`<div class='foo foo'></div>\`
      `,
      output: `
      html\`<div class='foo '></div>\`
      `,
      errors: [
        {
          messageId: "duplicateClass",
          column: 28,
          endColumn: 31,
        },
      ],
    },
  ],
});
