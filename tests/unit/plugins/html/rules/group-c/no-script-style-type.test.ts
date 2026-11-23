// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-script-style-type.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/no-script-style-type.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-script-style-type", rule, {
  valid: [
    {
      code: '<script src="https://script.js"></script>"',
    },
    {
      code: '<script type="module" src="https://script.js"></script>',
    },
    {
      code: '<link rel="stylesheet" href="https://styles.css" />',
    },
  ],
  invalid: [
    {
      code: '<script type="text/javascript" src="https://script.js"></script>',
      output: '<script  src="https://script.js"></script>',
      errors: [
        {
          messageId: "unnecessary",
        },
      ],
    },
    {
      code: '<style type="text/css"></style>',
      output: "<style ></style>",
      errors: [
        {
          messageId: "unnecessary",
        },
      ],
    },
    {
      code: '<link type="text/css" rel="stylesheet" href="https://styles.css" />',
      output: '<link  rel="stylesheet" href="https://styles.css" />',
      errors: [
        {
          messageId: "unnecessary",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-script-style-type", rule, {
  valid: [
    {
      code: 'html`<script src="https://script.js"></script>"`',
    },
  ],
  invalid: [
    {
      code: 'html`<script type="text/javascript" src="https://script.js"></script>`',
      output: 'html`<script  src="https://script.js"></script>`',
      errors: [
        {
          messageId: "unnecessary",
        },
      ],
    },
  ],
});
