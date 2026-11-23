// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-accesskey-attrs.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/no-accesskey-attrs.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-accesskey-attrs", rule, {
  valid: [
    {
      code: `<div></div>`,
    },
  ],
  invalid: [
    {
      code: `<div accesskey="h"></div>`,
      errors: [
        {
          message: "Unexpected use of accesskey attribute.",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-accesskey-attrs", rule, {
  valid: [
    {
      code: `html\`<div></div>\``,
    },
  ],
  invalid: [
    {
      code: `html\`<div accesskey="h"></div>\``,
      errors: [
        {
          message: "Unexpected use of accesskey attribute.",
        },
      ],
    },
  ],
});
