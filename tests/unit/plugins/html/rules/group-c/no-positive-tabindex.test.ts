// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-positive-tabindex.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/no-positive-tabindex.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-positive-tabindex", rule, {
  valid: [
    {
      code: `<span tabindex="0">foo</span>`,
    },
    {
      code: `<span tabindex="-1">foo</span>`,
    },
  ],
  invalid: [
    {
      code: `<span tabindex="1">foo</span>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
    {
      code: `<span tabindex="2">foo</span>`,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-positive-tabindex", rule, {
  valid: [
    {
      code: `html\`<span tabindex="0">foo</span>\``,
    },
    {
      code: `html\`<span tabindex="\${index}">foo</span>\``,
    },
  ],
  invalid: [
    {
      code: `html\`<span tabindex="1">foo</span>\``,
      errors: [
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});
