// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-multiple-h1.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupBRules } from "../../../../../../src/plugins/html/rules/group-b.js";
import rule from "../../../../../../src/plugins/html/rules/no-multiple-h1.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupBRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("no-multiple-h1", rule, {
  valid: [
    {
      code: `
<html>
<body>
<h1>one heading</h1>
</body>
</html>
`,
    },
  ],
  invalid: [
    {
      code: `
<html>
<body>
<h1>one heading</h1>
<h1>two heading</h1>
</body>
</html>
`,

      errors: [
        {
          messageId: "unexpectedMultiH1",
        },
        {
          messageId: "unexpectedMultiH1",
        },
      ],
    },
  ],
});
