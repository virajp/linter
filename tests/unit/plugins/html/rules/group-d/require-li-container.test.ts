// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-li-container.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-li-container.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("require-li-container", rule, {
  valid: [
    {
      code: `
<ul>
      <li>list</li>
</ul>
`,
    },
    {
      code: `
<ol>
      <li>list</li>
</ol>
`,
    },
    {
      code: `
<menu>
      <li>list</li>
</menu>
`,
    },
  ],
  invalid: [
    {
      code: `
<div>
      <li>list</li>
</div>
`,

      errors: [
        {
          messageId: "invalid",
        },
      ],
    },
    {
      code: `
<li>list</li>
`,

      errors: [
        {
          messageId: "invalid",
        },
      ],
    },
  ],
});
