// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-nested-interactive.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupBRules } from "../../../../../../src/plugins/html/rules/group-b.js";
import rule from "../../../../../../src/plugins/html/rules/no-nested-interactive.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupBRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-nested-interactive", rule, {
  valid: [
    {
      code: `<button></button>`,
    },
    {
      code: "<div><span></span></div>",
    },
    {
      code: `<div><button></button></div>`,
    },
    {
      code: `<a><button>click</button></a>`,
    },
    {
      code: "<button><audio></audio>",
    },
    {
      code: "<button><img src='foo.png'> click </button>",
    },
    {
      code: "<button><input type='hidden'> click </button>",
    },
    {
      code: "<label> text: <input type='text'></label>",
    },
    {
      code: `
      <details>
 <summary>Name & Extension:</summary>
 <input type=text value="Interactive Input">
</details>
      `,
    },
  ],
  invalid: [
    {
      code: `<a href="/foo"><button> click </button></a>`,
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "a",
          },
        },
      ],
    },
    {
      code: "<button><audio controls></audio></button>",
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "button",
          },
        },
      ],
    },
    {
      code: "<button><img usemap='#vending'></button>",
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "button",
          },
        },
      ],
    },
    {
      code: "<button><iframe src='https:...'></iframe></button>",
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "button",
          },
        },
      ],
    },
    {
      code: "<button><div></div><div><iframe src='https:...'></iframe></div></button>",
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "button",
          },
        },
      ],
    },
    {
      code: "<label><label>nesting label</label></label>",
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "label",
          },
        },
      ],
    },
    {
      code: `
      <details>
 <summary><input type=text value="Interactive Input"></summary>
</details>
      `,
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "summary",
          },
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-nested-interactive", rule, {
  valid: [
    {
      code: `html\`<button></button>\``,
    },
    {
      code: `
html\`<button></button>\`;
html\`<a href="foo"></a>\`;`,
    },
  ],
  invalid: [
    {
      code: `html\`<a href="/foo"><button> click </button></a>\``,
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "a",
          },
        },
      ],
    },
    {
      code: `html\`<a href="/foo">\${html\`<div></div>\`}<button>click</button></a>\``,
      errors: [
        {
          messageId: "unexpected",
          data: {
            tag: "a",
          },
        },
      ],
    },
  ],
});
