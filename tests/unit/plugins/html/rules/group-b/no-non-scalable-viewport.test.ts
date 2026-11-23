// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-non-scalable-viewport.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupBRules } from "../../../../../../src/plugins/html/rules/group-b.js";
import rule from "../../../../../../src/plugins/html/rules/no-non-scalable-viewport.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupBRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("no-non-scalable-viewport", rule, {
  valid: [
    {
      code: `
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
</body>
</html>
`,
    },
  ],
  invalid: [
    {
      code: `
  <html>
  <head>
  <meta name="viewport" content="width=device-width, user-scalable=no">
  </head>
  <body>
  </body>
  </html>
`,

      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `
  <html>
  <head>
  <meta name="viewport" content="user-scalable=no, width=device-width">
  </head>
  <body>
  </body>
  </html>
`,

      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});
