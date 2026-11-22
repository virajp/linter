// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/no-empty-sequence-entry.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../../../../../../src/plugins/yml/rules/no-empty-sequence-entry.js";
import { groupBRules } from "../../../../../../src/plugins/yml/rules/group-b.js";
import { YAMLLanguage } from "../../../../../../src/plugins/yml/language/index.js";
import { loadTestCases } from "../../helpers/utils.js";

const plugin = {
  rules: groupBRules,
  languages: { yaml: new YAMLLanguage() },
};

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  plugins: { yml: plugin },
  language: "yml/yaml",
});

tester.run(
  "no-empty-sequence-entry",
  rule,
  loadTestCases("no-empty-sequence-entry", plugin),
);
