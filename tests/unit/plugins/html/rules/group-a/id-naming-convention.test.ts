// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/id-naming-convention.test.js.
import { TEMPLATE_ENGINE_SYNTAX } from "@html-eslint/parser";
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/id-naming-convention.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("id-naming-convention", rule, {
  valid: [
    {
      code: `<div"> </div>`,
      options: ["camelCase"],
    },
    {
      code: `<div id="camelCase"> </div>`,
      options: ["camelCase"],
    },
    {
      code: `<div id="{{ID}}"> </div>`,
      options: ["camelCase"],
      languageOptions: {
        parserOptions: {
          templateEngineSyntax: TEMPLATE_ENGINE_SYNTAX.HANDLEBAR,
        },
      },
    },
    {
      code: `<div id="PascalCase"> </div>`,
      options: ["PascalCase"],
    },
    {
      code: `<div id="kebab-case"> </div>`,
      options: ["kebab-case"],
    },
    {
      code: `<div id="snake_case"> </div>`,
      options: ["snake_case"],
    },
    {
      code: `<div id="CuStOmReGeX"> </div>`,
      options: ["regex", { pattern: "^([A-Z][a-z])+[A-Z]?$" }],
    },
    {
      code: `<div id="CuStOmReGeX"> </div>`,
      options: ["regex", { pattern: "^[a-z]+$", flags: "i" }],
    },
  ],
  invalid: [
    {
      code: `<div id="kebab-case"> </div>`,
      options: ["PascalCase"],
      errors: [
        {
          message: "The id 'kebab-case' is not matched with the PascalCase.",
        },
      ],
    },
    {
      code: `<div id="kebab-case"> </div>`,
      options: ["snake_case"],
      errors: [
        {
          message: "The id 'kebab-case' is not matched with the snake_case.",
        },
      ],
    },
    {
      code: `<div id="kebab-case"> </div>`,
      options: ["regex", { pattern: "^([A-Z][a-z])+[A-Z]?$" }],
      errors: [
        {
          message: "The id 'kebab-case' is not matched with the regex.",
        },
      ],
    },
    {
      code: `<div id="kebab-case"> </div>`,
      options: ["regex", { pattern: "^([A-Z][a-z])+[A-Z]?$", flags: "i" }],
      errors: [
        {
          message: "The id 'kebab-case' is not matched with the regex.",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] id-naming-convention", rule, {
  valid: [
    {
      code: `html\`<div> </div>\`;`,
      options: ["camelCase"],
    },
    {
      code: `html\`<div id="camelCase"> </div>\`;`,
      options: ["camelCase"],
    },
    {
      code: `html\`<div id="\${foo}"> </div>\`;`,
      options: ["camelCase"],
    },
    {
      code: `html\`<div id=\${foo}> </div>\`;`,
      options: ["camelCase"],
    },
    {
      code: `html\`<div id=\${FOO}> </div>\`;`,
      options: ["camelCase"],
    },
  ],
  invalid: [
    {
      code: `html\`<div id="kebab-case"> </div>\`;`,
      options: ["PascalCase"],
      errors: [
        {
          message: "The id 'kebab-case' is not matched with the PascalCase.",
        },
      ],
    },
  ],
});
