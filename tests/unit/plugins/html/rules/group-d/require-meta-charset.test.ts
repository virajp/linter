// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-meta-charset.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-meta-charset.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("require-meta-charset", rule, {
  valid: [
    {
      code: `
<html>
      <head>
          <meta charset="UTF-8">
      </head>
</html>
`,
    },
    {
      code: `
<html>
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
          <meta name="description">
      </head>
</html>
`,
      output: `
<html>
      <head>
          <meta charset="UTF-8">
          <meta name="description">
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
      </head>
</html>
`,
      output: `
<html>
      <head>
      <meta charset="UTF-8">
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
          <meta charset="">
      </head>
</html>
`,
      output: `
<html>
      <head>
          <meta charset="UTF-8">
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
        <title> title </title>
        <meta foo="charset">
      </head>
</html>
`,
      output: `
<html>
      <head>
        <meta charset="UTF-8">
        <title> title </title>
        <meta foo="charset">
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
      // bare charset attribute with no value: <meta charset>
      code: `<html><head><meta charset></head></html>`,
      output: `<html><head><meta charset="UTF-8"></head></html>`,
      errors: [
        {
          messageId: "empty",
        },
      ],
    },
    {
      // head with no leading whitespace before first child
      code: `<html><head><title>t</title></head></html>`,
      output: `<html><head>\n            <meta charset="UTF-8"><title>t</title></head></html>`,
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      // completely empty head (zero children, no whitespace)
      code: `<html><head></head></html>`,
      output: `<html><head>\n        <meta charset="UTF-8"></head></html>`,
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
  ],
});
