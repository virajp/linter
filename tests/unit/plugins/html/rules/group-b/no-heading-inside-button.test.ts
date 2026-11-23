// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-heading-inside-button.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupBRules } from "../../../../../../src/plugins/html/rules/group-b.js";
import rule from "../../../../../../src/plugins/html/rules/no-heading-inside-button.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupBRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-heading-inside-button", rule, {
  valid: [
    {
      code: `<button>click</button>`,
    },
    {
      code: `<button><span>click</span></button>`,
    },
    {
      code: `<div><h1>title</h1></div>`,
    },
  ],
  invalid: [
    {
      code: `<button><h1>title</h1></button>`,

      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<button><h6>title</h6></button>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<button><span><h1>title</h1></span></button>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-heading-inside-button", rule, {
  valid: [
    {
      code: `html\`<button>click</button>\``,
    },
  ],
  invalid: [
    {
      code: `html\`<button><h1>click</h1></button>\``,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});
