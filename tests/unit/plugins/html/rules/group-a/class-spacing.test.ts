// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/class-spacing.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/class-spacing.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("class-spacing", rule, {
  valid: [
    {
      code: `<button class="foo"></button>`,
    },
    {
      code: `<button class="foo bar"></button>`,
    },
    {
      code: `<button class="foo bar baz"></button>`,
    },
    {
      code: `<button class=""></button>`,
    },
    {
      code: `<button class></button>`,
    },
    {
      code: `<button id=" foo "></button>`,
    },
  ],
  invalid: [
    {
      code: `<button class=" foo"></button>`,
      output: `<button class="foo"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `<button class="foo "></button>`,
      output: `<button class="foo"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `<button class=" foo "></button>`,
      output: `<button class="foo"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `<button class="  foo"></button>`,
      output: `<button class="foo"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `<button class="foo  "></button>`,
      output: `<button class="foo"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `<button class="foo  bar"></button>`,
      output: `<button class="foo bar"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
          column: 20,
          endColumn: 21,
        },
      ],
    },
    {
      code: `<button class="foo   bar"></button>`,
      output: `<button class="foo bar"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `<button class="foo  bar  baz"></button>`,
      output: `<button class="foo bar baz"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `<button class="  foo  bar  "></button>`,
      output: `<button class="foo bar"></button>`,
      errors: [
        {
          messageId: "extraSpacing",
        },
        {
          messageId: "extraSpacing",
        },
        {
          messageId: "extraSpacing",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] class-spacing", rule, {
  valid: [
    {
      code: "html`<div class='foo'></div>`",
    },
    {
      code: "html`<div class='foo bar'></div>`",
    },
    {
      code: "html`<div class=${' foo  bar '}></div>`",
    },
    {
      code: "html`<div class='${' foo  bar '} baz'></div>`",
    },
  ],
  invalid: [
    {
      code: `html\`<div class=' foo'></div>\``,
      output: `html\`<div class='foo'></div>\``,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `html\`<div class='foo '></div>\``,
      output: `html\`<div class='foo'></div>\``,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
    {
      code: `html\`<div class='foo  bar'></div>\``,
      output: `html\`<div class='foo bar'></div>\``,
      errors: [
        {
          messageId: "extraSpacing",
        },
      ],
    },
  ],
});
