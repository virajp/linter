// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-abstract-roles.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/no-abstract-roles.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-abstract-roles", rule, {
  valid: [
    {
      code: `<div role="any"> </div>`,
    },
  ],
  invalid: [
    {
      code: `<img role="command">`,
      errors: [
        {
          message: "Unexpected use of an abstract role.",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-abstract-roles", rule, {
  valid: [
    {
      code: `html\`<div role="any"> </div>\`;`,
    },
  ],
  invalid: [
    {
      code: `html\`<img role="command">\`;`,
      errors: [
        {
          message: "Unexpected use of an abstract role.",
        },
      ],
    },
  ],
});
