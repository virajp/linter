// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/quotes.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/quotes.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("quotes", rule, {
  valid: [
    {
      code: `<div id = " foo ">`,
    },
    {
      code: `<div id = "foo ">`,
    },
    {
      code: `<div id = " foo">`,
    },
    // https://github.com/yeonjuan/html-eslint/issues/95
    {
      code: `<div id='"foo"'></div>`,
    },
    {
      code: `<div id="'foo'"></div>`,
      options: ["single"],
    },
    {
      code: `
<div id="
foo">
`,
    },
    {
      code: `<div id="foo">`,
    },

    {
      code: `<div id="">`,
    },

    {
      code: `<div id>`,
    },
    {
      code: `<div aa>`,
    },
    {
      code: `<div id='foo'>`,
      options: ["single"],
    },
    {
      code: `<img src="?size=50&amp;default=retro">`,
    },
    {
      code: `<img src='?size=50&amp;default=retro'>`,
      options: ["single"],
    },
    {
      code: `<img src={{foo}}>`,
      languageOptions: {
        parserOptions: {
          templateEngineSyntax: {
            "{{": "}}",
          },
        },
      },
    },
  ],
  invalid: [
    {
      code: `<div id='foo'>`,
      output: `<div id="foo">`,
      errors: [
        {
          message: "Expected double(\") quotes but found single(').",
        },
      ],
    },
    {
      code: `<div id='
foo'>`,
      output: `<div id="
foo">`,
      errors: [
        {
          message: "Expected double(\") quotes but found single(').",
        },
      ],
    },
    {
      code: `<div id='foo' style='bar'>`,
      output: `<div id="foo" style="bar">`,
      errors: [
        {
          messageId: "unexpected",
        },
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<div id="foo">`,
      output: `<div id='foo'>`,
      options: ["single"],
      errors: [
        {
          message: "Expected single(') quotes but found double(\").",
        },
      ],
    },
    {
      code: `<div id=foo>`,
      output: `<div id="foo">`,
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      code: `<div id=
foo>`,
      output: `<div id=
"foo">`,
      errors: [
        {
          message: 'Expected double(") quotes but no quotes found.',
        },
      ],
    },
    {
      code: `<div id=  foo>`,
      output: `<div id=  "foo">`,
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      code: `<img src='?size=50&amp;default=retro'>`,
      output: `<img src="?size=50&amp;default=retro">`,
      options: ["double"],
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<img src = '?size=50&amp;default=retro'>`,
      output: `<img src = "?size=50&amp;default=retro">`,
      options: ["double"],
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] quotes", rule, {
  valid: [
    {
      code: `html\`<div id = " foo ">\``,
    },
    {
      code: `html\`<div id = "\${foo}">\``,
    },
    {
      code: `
const handler = () => {};
html\`<div onclick=\${handler}></div>\``,
    },
    {
      code: `html\`<div id = "\${foo}">\``,
      options: ["double", { enforceTemplatedAttrValue: true }],
    },
    {
      code: `html\`<div id = '\${foo}'>\``,
      options: ["single", { enforceTemplatedAttrValue: true }],
    },
  ],
  invalid: [
    {
      code: `html\`<div id = ' foo '>\``,
      output: `html\`<div id = " foo ">\``,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `html\`<div id = \${foo}>\``,
      output: `html\`<div id = "\${foo}">\``,
      options: ["double", { enforceTemplatedAttrValue: true }],
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      code: `html\`<div id = '\${foo}'>\``,
      output: `html\`<div id = "\${foo}">\``,
      options: ["double", { enforceTemplatedAttrValue: true }],
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `html\`<div id = prefix_\${foo}>\``,
      output: `html\`<div id = 'prefix_\${foo}'>\``,
      options: ["single", { enforceTemplatedAttrValue: true }],
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
  ],
});
