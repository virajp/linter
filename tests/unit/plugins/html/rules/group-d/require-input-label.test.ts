// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-input-label.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-input-label.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-input-label", rule, {
  valid: [
    {
      code: `<label for="foo">Foo</label><input id="foo">`,
    },
    {
      code: `<label for="foo">Foo</label><textarea id="foo"></textarea>`,
    },
    {
      code: `<input type="hidden">`,
    },
    {
      code: `<label>name: <input></label>`,
    },
    {
      code: `<textarea aria-labelledby="foo" />`,
    },
    {
      code: `<textarea aria-label="foo" />`,
    },
    // self-labeling button/submit/reset via value attribute
    { code: `<input type="button" value="Click me">` },
    { code: `<input type="submit" value="Submit">` },
    { code: `<input type="reset" value="Reset">` },
    // self-labeling image via alt, title, or value
    { code: `<input type="image" alt="Submit">` },
    { code: `<input type="image" title="Submit">` },
    { code: `<input type="image" value="Submit">` },
  ],
  invalid: [
    {
      code: `<input type="text">`,
      errors: [
        {
          messageId: "missingLabel",
        },
      ],
    },
    {
      code: `<textarea></textarea>`,
      errors: [
        {
          messageId: "missingLabel",
        },
      ],
    },
    {
      code: `<label>name: </label><input type="text">`,
      errors: [
        {
          messageId: "missingLabel",
        },
      ],
    },
    // id alone (without <label for>) is not sufficient
    {
      code: `<input id="foo">`,
      errors: [{ messageId: "missingLabel", line: 1, column: 1 }],
    },
    // self-labeling types without their labeling attribute
    {
      code: `<input type="button">`,
      errors: [{ messageId: "missingLabel", line: 1, column: 1 }],
    },
    {
      code: `<input type="submit">`,
      errors: [{ messageId: "missingLabel", line: 1, column: 1 }],
    },
    {
      code: `<input type="reset">`,
      errors: [{ messageId: "missingLabel", line: 1, column: 1 }],
    },
    {
      code: `<input type="button" value="">`,
      errors: [{ messageId: "missingLabel", line: 1, column: 1 }],
    },
    {
      code: `<input type="image">`,
      errors: [{ messageId: "missingLabel", line: 1, column: 1 }],
    },
  ],
});

templateRuleTester.run("[template] require-input-label", rule, {
  valid: [
    {
      code: `html\`<label for="foo">Foo</label><input id="foo">\``,
    },
    {
      code: `html\`<label>name: <input></label>\``,
    },
    {
      // label and input in same nested doc → valid
      code: 'html`${html`<label for="foo">Foo</label><input id="foo">`}`',
    },
    { code: 'html`<input type="button" value="Click me">`' },
    { code: 'html`<input type="image" alt="Submit">`' },
  ],
  invalid: [
    {
      code: `html\`<input type="text">\``,
      errors: [
        {
          messageId: "missingLabel",
        },
      ],
    },
    {
      // label in outer doc, input in inner doc → inner input not labeled
      code: 'html`<label for="foo">Foo</label>${html`<input id="foo">`}`',
      errors: [
        {
          messageId: "missingLabel",
        },
      ],
    },
    {
      // label in inner doc, input in outer doc → outer input not labeled
      code: 'html`<input id="foo">${html`<label for="foo">Foo</label>`}`',
      errors: [
        {
          messageId: "missingLabel",
        },
      ],
    },
    {
      code: 'html`<input type="button">`',
      errors: [{ messageId: "missingLabel" }],
    },
    {
      code: 'html`<input type="image">`',
      errors: [{ messageId: "missingLabel" }],
    },
  ],
});
