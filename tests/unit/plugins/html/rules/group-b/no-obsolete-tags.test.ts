// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/no-obsolete-tags.test.js.
import type { ESLint } from "eslint";
import { OBSOLETE_TAGS } from "../../../../../../src/plugins/html/constants/index.js";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupBRules } from "../../../../../../src/plugins/html/rules/group-b.js";
import rule from "../../../../../../src/plugins/html/rules/no-obsolete-tags.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupBRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("no-obsolete-tags", rule, {
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
  ],
  invalid: [
    ...OBSOLETE_TAGS.filter((tag) => tag !== "frame").map((tag) => ({
      code: `<${tag}></${tag}>`,
      errors: [
        {
          message: `Unexpected use of obsolete tag <${tag}>`,
        },
      ],
    })),
    {
      code: `
<frameset cols="25%,*,25%">
    <frame name="left" src="/html/intro"/>
</frameset>`,
      errors: [
        {
          messageId: "unexpected",
        },
        {
          messageId: "unexpected",
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] no-obsolete-tags", rule, {
  valid: [
    {
      code: `
html\`<html>
<body>
<h1>one heading</h1>
</body>
</html>\`;
`,
    },
  ],
  invalid: [
    ...OBSOLETE_TAGS.filter((tag) => tag !== "frame").map((tag) => ({
      code: `html\`<${tag}></${tag}>\`;`,
      errors: [
        {
          message: `Unexpected use of obsolete tag <${tag}>`,
        },
      ],
    })),
  ],
});
