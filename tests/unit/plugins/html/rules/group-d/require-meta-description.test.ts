// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-meta-description.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-meta-description.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("require-meta-description", rule, {
  valid: [
    {
      code: `
<html>
      <head>
          <meta name="description" content="foo">
      </head>
</html>
`,
    },
    {
      code: `
<html>
      <head>
          <meta name="Description" content="foo">
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
          <meta name="author" content="Yeon JuAn">
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
          <meta name="description">
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
          <meta name="description" content="">
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
          <meta name="description" content="  ">
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
          <meta name="description" content>
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
