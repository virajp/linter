// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/prefer-https.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/prefer-https.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("prefer-https", rule, {
  valid: [
    {
      code: `<script></script>`,
    },
    {
      code: `<script src="https://script.js">`,
    },
    {
      code: `<img src="https://image.png">`,
    },
    {
      code: `<iframe src="/absolute.html"></iframe>`,
    },
    {
      code: `<audio src="relative.mp3"></iframe>`,
    },
    {
      code: `<video src="./relative.mp3"></iframe>`,
    },
    {
      code: `<link href="https://foo.css" rel="stylesheet" />`,
    },
    {
      code: `<object type="application/pdf" data="/media/examples/In-CC0.pdf"></object>`,
    },
  ],
  invalid: [
    {
      code: `<script src="http://script.js">`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<img src="http://image.png">`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<link href="http://foo.css" rel="stylesheet" />`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<object type="application/pdf" data="http://media/examples/In-CC0.pdf"></object>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] prefer-https", rule, {
  valid: [
    {
      code: "html`<script></script>`",
    },
    {
      code: `html\`<img src="\${variableLink}">\``,
    },
  ],
  invalid: [
    {
      code: `html\`<script src="http://script.js">\``,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});
