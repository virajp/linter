// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/require-lang.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/require-lang.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("require-lang", rule, {
  valid: [
    {
      code: `
<html lang="ko">
</html>
`,
    },
  ],
  invalid: [
    {
      code: `
<html>
</html>
`,

      errors: [
        {
          messageId: "missing",
          line: 2,
          column: 1,
          endColumn: 7,
          endLine: 2,
        },
      ],
    },
    {
      code: `
<html lang="">
</html>
`,

      errors: [
        {
          messageId: "empty",
        },
      ],
    },
    {
      code: `
<html lang="  ">
</html>
`,

      errors: [
        {
          messageId: "empty",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] require-lang", rule, {
  valid: [
    {
      code: `html\`<html lang="ko"></html>\``,
    },
    {
      code: `html\`<html lang="\${lang}"></html>\``,
    },
  ],
  invalid: [
    {
      code: `html\`<html></html>\``,
      errors: [
        {
          messageId: "missing",
        },
      ],
    },
  ],
});
