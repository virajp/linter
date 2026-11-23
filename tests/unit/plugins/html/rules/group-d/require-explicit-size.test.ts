// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-explicit-size.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-explicit-size.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-explicit-size", rule, {
  valid: [
    {
      code: "<div></div>",
    },
    {
      code: `<img width="200px" height="300px">`,
    },
    {
      code: `<iframe width="200px" height="300px">`,
    },
    {
      code: `<img class="size" width="200px">`,
      options: [
        {
          allowClass: ["size"],
        },
      ],
    },
    {
      code: `<img class="other size" width="200px">`,
      options: [
        {
          allowClass: ["size"],
        },
      ],
    },
    {
      code: `<img id="foo">`,
      options: [
        {
          allowId: ["foo"],
        },
      ],
    },
    {
      code: `<img id="foo">`,
      options: [
        {
          allowId: ["bar", "foo"],
        },
      ],
    },
  ],
  invalid: [
    {
      code: `<img width="200px">`,
      errors: [
        {
          messageId: "missingHeight",
        },
      ],
    },
    {
      code: `<img height="200px">`,
      errors: [
        {
          messageId: "missingWidth",
        },
      ],
    },
    {
      code: `<iframe></iframe>`,
      errors: [
        {
          messageId: "missingHeight",
        },
        {
          messageId: "missingWidth",
        },
      ],
    },
    {
      code: `<img class="foo" width="200px">`,
      errors: [
        {
          messageId: "missingHeight",
        },
      ],
      options: [
        {
          allowClass: ["size"],
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] require-explicit-size", rule, {
  valid: [
    {
      code: "html`<div></div>`",
    },
    {
      code: 'html`<img width="200px" height="200px">`',
    },
    {
      code: 'html`<img width="200px" class="size">`',
      options: [
        {
          allowClass: ["size"],
        },
      ],
    },
    {
      code: 'html`<img id="size">`',
      options: [
        {
          allowId: ["size"],
        },
      ],
    },
    {
      code: "html`<img width=${width} height=${height}>`",
    },
  ],
  invalid: [
    {
      code: `html\`<img width="200px">\``,
      errors: [
        {
          messageId: "missingHeight",
        },
      ],
    },
    {
      code: `html\`<iframe width="200px">\``,
      errors: [
        {
          messageId: "missingHeight",
        },
      ],
    },
  ],
});
