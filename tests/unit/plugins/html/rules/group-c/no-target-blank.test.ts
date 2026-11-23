// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-target-blank.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/no-target-blank.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-target-blank", rule, {
  valid: [
    {
      code: `<a target='_blank' rel='noreferrer' href='http://www.foo.com'></a>`,
    },
    {
      code: `<a target='_blank' rel='noreferrer noopener' href='http://www.foo.com'></a>`,
    },
    {
      code: `<a target='_blank' href='/foo'></a>`,
    },
    {
      code: `<a target='_blank' href='./foo'></a>`,
    },
  ],
  invalid: [
    {
      code: `<a target='_blank' href='http://www.foo.com'></a>`,
      errors: [
        {
          message: 'Missing `rel="noreferrer"` attribute in a tag.',
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-target-blank", rule, {
  valid: [
    {
      code: "html`<a target='_blank' rel='noreferrer' href='http://www.foo.com'></a>`",
    },
    {
      code: "html`<a target='${target}' href='http://www.foo.com'></a>`",
    },
    {
      code: "html`<a target='_blank' rel='${rel}' href='http://www.foo.com'></a>`",
    },
  ],
  invalid: [
    {
      code: "html`<a target='_blank' href='http://www.foo.com'></a>`",
      errors: [
        {
          message: 'Missing `rel="noreferrer"` attribute in a tag.',
        },
      ],
    },
  ],
});
