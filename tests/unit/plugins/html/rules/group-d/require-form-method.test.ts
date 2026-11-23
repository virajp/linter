// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-form-method.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-form-method.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-form-method", rule, {
  valid: [
    {
      code: "<div></div>",
    },
    {
      code: '<form method="POST"></form>',
    },
    {
      code: '<form method="post"></form>',
    },
    {
      code: '<form method="GET"></form>',
    },
    {
      code: '<form method="get"></form>',
    },
    {
      code: '<form method="DIALOG"></form>',
    },
    {
      code: '<form method="dialog"></form>',
    },
  ],
  invalid: [
    {
      code: "<form></form>",
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      code: "<form method></form>",
      errors: [
        {
          messageId: "missingValue",
        },
      ],
    },
    {
      code: "<form method='other'></form>",
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] require-form-method", rule, {
  valid: [
    {
      code: "html`<div></div>`",
    },
    {
      code: "html`<form method='GET'></form>`",
    },
    {
      code: 'html`<form method="${METHOD}"></form>`',
    },
  ],
  invalid: [
    {
      code: "html`<form method='other'></form>`",
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});
