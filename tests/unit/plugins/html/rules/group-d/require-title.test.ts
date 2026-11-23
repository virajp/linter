// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-title.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-title.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("require-title", rule, {
  valid: [
    {
      code: `
<html>
<head>
<title> title </title>
</head>
</html>
`,
    },
  ],
  invalid: [
    {
      code: `
<html>
<head>
</head>
</html>
`,

      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      code: `
<html>
<head>
<title></title>
</head>
</html>
`,

      errors: [
        {
          messageId: "empty",
        },
      ],
    },
    {
      code: `
<html>
<head>
<title>
</title>
</head>
</html>
`,

      errors: [
        {
          messageId: "empty",
        },
      ],
    },
  ],
});
