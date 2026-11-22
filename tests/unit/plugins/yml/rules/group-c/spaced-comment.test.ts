// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/spaced-comment.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import rule from "../../../../../../src/plugins/yml/rules/spaced-comment.js";
import { groupCRules } from "../../../../../../src/plugins/yml/rules/group-c.js";
import { YAMLLanguage } from "../../../../../../src/plugins/yml/language/index.js";
import { loadTestCases } from "../../helpers/utils.js";

const plugin = {
  rules: groupCRules,
  languages: { yaml: new YAMLLanguage() },
};

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({});

tester.run("spaced-comment", rule, loadTestCases("spaced-comment", plugin));
