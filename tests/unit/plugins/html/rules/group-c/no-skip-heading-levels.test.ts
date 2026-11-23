// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-skip-heading-levels.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupCRules } from "../../../../../../src/plugins/html/rules/group-c.js";
import rule from "../../../../../../src/plugins/html/rules/no-skip-heading-levels.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupCRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("no-skip-heading-levels", rule, {
  valid: [
    {
      code: `
<html>
<body>
<h1>one heading</h1>
</body>
</html>
`,
    },
    {
      code: `
<html>
<body>
<h1>one heading</h1>
<h2>one heading</h2>
<h3>one heading</h3>
</body>
</html>
`,
    },
    {
      code: `
<html>
<body>
<h1>one heading</h1>
<h2>one heading</h2>
<h2>one heading</h2>
</body>
</html>
`,
    },
    {
      code: `
<html>
<body>
<h1>one heading</h1>
<h2>one heading</h2>
<h1>one heading</h1>
</body>
</html>
`,
    },
    {
      code: `
<div>
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>
</div>
`,
    },
  ],
  invalid: [
    {
      code: `
<html>
<body>
<h1>one heading</h1>
<h3>one heading</h3>
</body>
</html>
`,

      errors: [
        {
          message: "Unexpected skipping heading level. <h2> is expected",
        },
      ],
    },
  ],
});
