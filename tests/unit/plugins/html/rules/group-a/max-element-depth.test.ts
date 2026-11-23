// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/max-element-depth.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/max-element-depth.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("max-element-depth", rule, {
  valid: [
    {
      code: `<div> </div>`,
    },
    {
      code: `<div><div></div></div>`,
    },
    {
      code: `<div><div></div></div>`,
      options: [
        {
          max: 2,
        },
      ],
    },
    {
      code: `
<div><div></div></div>
<div><div></div></div>
`,
      options: [
        {
          max: 2,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `<div><div><div></div></div></div>`,
      options: [
        {
          max: 2,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 2, but found 3",
        },
      ],
    },
    {
      code: `
<div><div></div></div>
<div><div><div></div></div></div>
<div><div></div></div>
`,
      options: [
        {
          max: 2,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 2, but found 3",
        },
      ],
    },
    {
      code: `
<div><div></div></div>
<div><div><div><script></script></div></div></div>
<div><div><div><style></style></div></div></div>
<div><div></div></div>
  `,
      options: [
        {
          max: 3,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 3, but found 4",
        },
        {
          message:
            "Expected the depth of nested elements to be <= 3, but found 4",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] max-element-depth", rule, {
  valid: [
    {
      code: `html\`<div> </div>\``,
    },
    {
      code: `html\`<div><div></div></div>\``,
    },
    {
      code: `html\`<div><div></div></div>\``,
      options: [
        {
          max: 2,
        },
      ],
    },
    {
      code: `html\`
    <div><div></div></div>
    <div><div></div></div>\`;
    `,
      options: [
        {
          max: 2,
        },
      ],
    },
    {
      code: `
  html\`
  <div>
      <div>
          \${html\`<div></div>\`}
      </div>
  </div>\`
          `,
      options: [
        {
          max: 2,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `html\`<div><div><div></div></div></div>\``,
      options: [
        {
          max: 2,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 2, but found 3",
        },
      ],
    },
    {
      code: `html\`
    <div><div></div></div>
    <div><div><div></div></div></div>
    <div><div></div></div>\`;
    `,
      options: [
        {
          max: 2,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 2, but found 3",
        },
      ],
    },
    {
      code: `html\`
    <div><div></div></div>
    <div><div><div><script></script></div></div></div>
    <div><div><div><style></style></div></div></div>
    <div><div></div></div>\`
      `,
      options: [
        {
          max: 3,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 3, but found 4",
        },
        {
          message:
            "Expected the depth of nested elements to be <= 3, but found 4",
        },
      ],
    },
    {
      code: `
    html\`
<div>
    <div>
        \${html\`<div><div><div></div></div></div>\`}
    </div>
</div>\`
            `,
      options: [
        {
          max: 2,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 2, but found 3",
        },
      ],
    },
    {
      code: `
      html\`
  <div>
      <div>
          \${html\`<div><div></div></div>\`}
          \${html\`<div><div><div></div></div></div>\`}
          \${html\`<div><div></div></div>\`}
      </div>
  </div>\`
              `,
      options: [
        {
          max: 2,
        },
      ],
      errors: [
        {
          message:
            "Expected the depth of nested elements to be <= 2, but found 3",
        },
      ],
    },
  ],
});
