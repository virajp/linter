// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-button-type.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/require-button-type.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-button-type", rule, {
  valid: [
    {
      code: `<button type="submit">Submit Button</button>`,
    },
    {
      code: `<button type="button">Button</button>`,
    },
    {
      code: `<button type="reset">Reset Button</button>`,
    },
  ],
  invalid: [
    {
      code: `<button>Missing type</button>`,
      errors: [
        {
          messageId: "missing",
          line: 1,
          column: 1,
        },
      ],
      output: `<button type="submit">Missing type</button>`,
    },
    {
      code: `<button/>`,
      errors: [
        {
          messageId: "missing",
          line: 1,
          column: 1,
        },
      ],
      output: `<button type="submit"/>`,
    },
    {
      code: `<button id="foo">Missing type</button>`,
      errors: [
        {
          messageId: "missing",
          line: 1,
          column: 1,
        },
      ],
      output: `<button type="submit" id="foo">Missing type</button>`,
    },
    {
      code: `<button type="invalid">Invalid type</button>`,
      errors: [
        {
          message: '"invalid" is an invalid value for button type attribute.',
          line: 1,
          column: 9,
          suggestions: [
            {
              messageId: "replaceToSubmit",
              output: `<button type="submit">Invalid type</button>`,
            },
            {
              messageId: "replaceToButton",
              output: `<button type="button">Invalid type</button>`,
            },
            {
              messageId: "replaceToReset",
              output: `<button type="reset">Invalid type</button>`,
            },
          ],
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] require-button-type", rule, {
  valid: [
    {
      code: 'html`<button type="submit">Submit Button</button>`',
    },
    {
      code: 'html`<button type="${type}">Submit Button</button>`',
    },
  ],
  invalid: [
    {
      code: "html`<button>Missing type</button>`",
      errors: [
        {
          messageId: "missing",
          line: 1,
          column: 6,
        },
      ],
      output: 'html`<button type="submit">Missing type</button>`',
    },
  ],
});
