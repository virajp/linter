// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-img-alt.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-img-alt.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-img-alt", rule, {
  valid: [
    {
      code: `
<img src="./image.png" alt="image description"/>
`,
    },
    {
      code: `
<img src="./image.png" alt=""/>
`,
    },
    {
      code: `
<img src="./image.png" [alt]="image description"/>
`,
      options: [{ substitute: ["[alt]"] }],
    },
    {
      code: `
<img src="./image.png" [attr.alt]="image description"/>
`,
      options: [{ substitute: ["[alt]", "[attr.alt]"] }],
    },
    {
      code: `
<html>
  <body>
    <img src="./image.png" alt="image description">
  </body>
</html>
`,
    },
    {
      code: `
<html>
  <body>
    <img src="./image.png" alt="">
  </body>
</html>
`,
    },
  ],
  invalid: [
    {
      code: `
<img src="./image.png"/>
`,
      errors: [
        {
          messageId: "missingAlt",
          suggestions: [
            {
              messageId: "insertAlt",
              output: `
<img src="./image.png" alt=""/>
`,
            },
          ],
        },
      ],
    },
    {
      code: `
<html>
  <body>
    <img src="./image.png">
  </body>
</html>
`,
      errors: [
        {
          messageId: "missingAlt",
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 28,
          suggestions: [
            {
              messageId: "insertAlt",
              output: `
<html>
  <body>
    <img src="./image.png" alt="">
  </body>
</html>
`,
            },
          ],
        },
      ],
    },
    {
      code: `
<html>
  <body>
    <img src="./image.png">
  </body>
</html>
`,
      options: [{ substitute: ["[alt]"] }],
      errors: [
        {
          messageId: "missingAlt",
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 28,
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] require-img-alt", rule, {
  valid: [
    {
      code: `html\`<img src="./image.png" alt="image description"/>\``,
    },
    {
      code: `html\`<img src="./image.png" alt="\${alt}"/>\``,
    },
    {
      code: `html\`<img src="./image.png" alt=""/>\``,
    },
  ],
  invalid: [
    {
      code: `html\`<img src="./image.png"/>\``,
      errors: [
        {
          messageId: "missingAlt",
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 30,
          suggestions: [
            {
              messageId: "insertAlt",
              output: `html\`<img src="./image.png" alt=""/>\``,
            },
          ],
        },
      ],
    },
  ],
});
