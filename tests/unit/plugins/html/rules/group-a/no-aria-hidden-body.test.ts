// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-aria-hidden-body.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/no-aria-hidden-body.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-aria-hidden-body", rule, {
  valid: [
    {
      code: `<div aria-hidden> </div>`,
    },
    {
      code: `<body aria-hidden="false"> </body>`,
    },
    {
      code: `<body> </body>`,
    },
  ],
  invalid: [
    {
      code: `<body aria-hidden> </body>`,
      errors: [
        {
          message: "Unexpected aria-hidden on body tag.",
        },
      ],
    },
    {
      code: `<body aria-hidden="true"> </body>`,
      errors: [
        {
          message: "Unexpected aria-hidden on body tag.",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-aria-hidden-body", rule, {
  valid: [
    {
      code: `html\`<div aria-hidden> </div>\``,
    },
    {
      code: `html\`<body aria-hidden=\${value}> </body>\``,
    },
  ],
  invalid: [
    {
      code: `html\`<body aria-hidden="true"> </body>\``,
      errors: [
        {
          message: "Unexpected aria-hidden on body tag.",
        },
      ],
    },
  ],
});
