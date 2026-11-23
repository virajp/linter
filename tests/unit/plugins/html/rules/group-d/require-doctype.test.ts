// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-doctype.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-doctype.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);

ruleTester.run("require-doctype", rule, {
  valid: [
    {
      code: `
<!DOCTYPE html>
<html>
</html>
`,
    },
    {
      code: `
<div></div>
      `,
    },
  ],
  invalid: [
    {
      code: `<html>
</html>
`,
      output: `<!DOCTYPE html>
<html>
</html>
`,

      errors: [
        {
          messageId: "missing",
        },
      ],
    },
  ],
});
