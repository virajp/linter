// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/no-irregular-whitespace.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../../../../../../src/plugins/yml/rules/no-irregular-whitespace.js";
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

const tester = new RuleTester({});

tester.run(
  "no-irregular-whitespace",
  rule,
  loadTestCases("no-irregular-whitespace", plugin),
);
