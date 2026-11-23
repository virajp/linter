// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-frame-title.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-frame-title.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-frame-title", rule, {
  valid: [
    {
      code: `<iframe title="foo"></iframe>`,
    },
    {
      code: `
<frameset cols="10%, 90%">
<frame src="nav.html" title="bar" />
<frame src="doc.html" title="baz" />
</frameset>
`,
    },
  ],
  invalid: [
    {
      code: `<iframe></iframe>`,
      errors: [
        {
          message: "Missing `title` attribute in <iframe>.",
        },
      ],
    },
    {
      code: `<iframe title=""></iframe>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<iframe title></iframe>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `
<frameset cols="10%, 90%">
<frame src="nav.html"/>
</frameset>`,
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
    {
      code: `
<frameset cols="10%, 90%">
<frame src="nav.html" title=""/>
</frameset>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `
<frameset cols="10%, 90%">
<frame src="nav.html" title/>
</frameset>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] require-iframe-title", rule, {
  valid: [
    {
      code: 'html`<iframe title="foo"></iframe>`',
    },
    {
      code: 'html`<iframe title="${title}"></iframe>`',
    },
  ],
  invalid: [
    {
      code: 'html`<iframe title=""></iframe>`',
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});
