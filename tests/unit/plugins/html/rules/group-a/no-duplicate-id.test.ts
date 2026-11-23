// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-duplicate-id.test.js.
import { TEMPLATE_ENGINE_SYNTAX } from "@html-eslint/parser";
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupARules } from "../../../../../../src/plugins/html/rules/group-a.js";
import rule from "../../../../../../src/plugins/html/rules/no-duplicate-id.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupARules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;
const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-duplicate-id", rule, {
  valid: [
    {
      code: `
<html>
<body>
  <div id = "foo"></div>
  <div id = "bar"></div>
</body>
</html>
`,
    },
    // Duplicates in mutually exclusive Twig if/else branches are not errors.
    {
      code: `
<p>
  {% if result %}
    <span id="status">yes</span>
  {% else %}
    <span id="status">no</span>
  {% endif %}
</p>
`,
      languageOptions: {
        parserOptions: {
          templateEngineSyntax: TEMPLATE_ENGINE_SYNTAX.TWIG,
        },
      },
    },
    // Original use case: four spans in four branches.
    {
      code: `
<p>
  {% if check_result is same as(null) %}
    <span id="acc_check_result"></span>
  {% elseif check_result is same as(false) %}
    <span id="acc_check_result" class="failure">Invalid</span>
  {% elseif check_result is same as(true) %}
    <span id="acc_check_result" class="success">Valid</span>
  {% else %}
    <span id="acc_check_result" class="failure">Wrong key</span>
  {% endif %}
</p>
`,
      languageOptions: {
        parserOptions: {
          templateEngineSyntax: TEMPLATE_ENGINE_SYNTAX.TWIG,
        },
      },
    },
  ],
  invalid: [
    {
      code: `
<html>
<body>
  <div id = "foo"></div>
  <div id = "foo"></div>
</body>
</html>
`,
      errors: [
        {
          messageId: "duplicateId",
        },
        {
          message: "The id 'foo' is duplicated.",
        },
      ],
    },
    {
      code: `
<html>
<body>
  <div id = "foo"></div>
  <a id = "foo"></div>
</body>
</html>
`,

      errors: [
        {
          messageId: "duplicateId",
          line: 4,
        },
        {
          messageId: "duplicateId",
          line: 5,
        },
      ],
    },
    // Duplicates in two SEPARATE if-blocks can both render simultaneously
    // and must still be reported.
    {
      code: `
{% if c1 %}<div id="foo"></div>{% endif %}
{% if c2 %}<div id="foo"></div>{% endif %}
`,
      languageOptions: {
        parserOptions: {
          templateEngineSyntax: TEMPLATE_ENGINE_SYNTAX.TWIG,
        },
      },
      errors: [{ messageId: "duplicateId" }, { messageId: "duplicateId" }],
    },
  ],
});

templateRuleTester.run("[template] no-duplicate-id", rule, {
  valid: [
    {
      code: `
html\`<html>
<body>
  <div id = "foo"></div>
  <div id = "bar"></div>
</body>
</html>\`
`,
    },
    {
      code: `const code = /* html */\`<html>
<body>
  <div id = "foo"></div>
  <div id = "bar"></div>
</body>
</html>\``,
    },
  ],
  invalid: [
    {
      code: `
html\`<html>
<body>
  <div id = "foo"></div>
  <a id = "foo"></div>
</body>
</html>\`
`,

      errors: [
        {
          messageId: "duplicateId",
          line: 4,
        },
        {
          messageId: "duplicateId",
          line: 5,
        },
      ],
    },
    {
      code: `
html\`<html>
<body>
  <div id = "\${foo}"></div>
  <a id = "\${foo}"></div>
</body>
</html>\`
`,

      errors: [
        {
          messageId: "duplicateId",
          line: 4,
        },
        {
          messageId: "duplicateId",
          line: 5,
        },
      ],
    },
    {
      code: `
/* html */\`<html>
<body>
  <div id = "\${foo}"></div>
  <a id = "\${foo}"></div>
</body>
</html>\`
`,

      errors: [
        {
          messageId: "duplicateId",
          line: 4,
        },
        {
          messageId: "duplicateId",
          line: 5,
        },
      ],
    },
  ],
});
