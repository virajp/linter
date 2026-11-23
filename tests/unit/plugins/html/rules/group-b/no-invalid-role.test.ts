// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-invalid-role.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupBRules } from "../../../../../../src/plugins/html/rules/group-b.js";
import rule from "../../../../../../src/plugins/html/rules/no-invalid-role.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupBRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-invalid-role", rule, {
  valid: [
    {
      code: "<div></div>",
    },
    {
      code: '<div role="grid"></div>',
    },
    {
      code: `<img role="presentation" alt="">`,
    },
  ],
  invalid: [
    {
      code: "<div role='foo'></div>",
      errors: [
        {
          messageId: "invalid",
        },
      ],
    },
    {
      code: "<div role=''></div>",
      errors: [
        {
          messageId: "invalid",
        },
      ],
    },
    {
      code: "<button role='presentation'></button>",
      errors: [
        {
          messageId: "invalidPresentation",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-invalid-role", rule, {
  valid: [
    {
      code: 'html`<div role="grid"></div>`',
    },
    {
      code: `
const role = "grid";
html\`<div role="\${role}"></div>\``,
    },
  ],
  invalid: [
    {
      code: "html`<div role='foo'></div>`",
      errors: [
        {
          message: "Unexpected use of invalid role 'foo'",
        },
      ],
    },
    {
      code: "html`<button role='presentation'></button>`",
      errors: [
        {
          message: "Unexpected use of presentation role on <button>",
        },
      ],
    },
    {
      code: "html`<button role='none'></button>`",
      errors: [
        {
          message: "Unexpected use of presentation role on <button>",
        },
      ],
    },
  ],
});
