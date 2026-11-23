// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-invalid-entity.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupBRules } from "../../../../../../src/plugins/html/rules/group-b.js";
import rule from "../../../../../../src/plugins/html/rules/no-invalid-entity.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupBRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-invalid-entity", rule, {
  valid: [
    { code: "<p>&lt; &gt; &amp; &nbsp;</p>" },
    { code: "<p>&#xD55C;</p>" },
  ],
  invalid: [
    {
      code: "<p>&nbsb;</p>", // Typo in entity name
      errors: [{ message: "Invalid HTML entity '&nbsb;' used." }],
    },
    {
      code: "<p>&unknown;</p>", // Undefined entity
      errors: [{ message: "Invalid HTML entity '&unknown;' used." }],
    },
    {
      code: "<p>&#zzzz;</p>", // Invalid numeric entity
      errors: [{ message: "Invalid HTML entity '&#zzzz;' used." }],
    },
    {
      code: "<p>&#x110000;</p>",
      errors: [{ message: "Invalid HTML entity '&#x110000;' used." }],
    },
  ],
});

templateRuleTester.run("[template] no-invalid-entity", rule, {
  valid: [{ code: `html\`<p>&lt; &gt; &amp; &nbsp;</p>\`` }],
  invalid: [
    {
      code: "html`<p>&nbsb;</p>`",
      errors: [{ message: "Invalid HTML entity '&nbsb;' used." }],
    },
  ],
});
