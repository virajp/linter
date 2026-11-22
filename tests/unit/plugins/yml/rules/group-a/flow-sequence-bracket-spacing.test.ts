// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/flow-sequence-bracket-spacing.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { YAMLLanguage } from "../../../../../../src/plugins/yml/language/index.js";
import { groupARules } from "../../../../../../src/plugins/yml/rules/group-a.js";
import rule from "../../../../../../src/plugins/yml/rules/flow-sequence-bracket-spacing.js";
import { loadTestCases } from "../../helpers/utils.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const plugin = { rules: groupARules, languages: { yaml: new YAMLLanguage() } };

const tester = new RuleTester({});

tester.run(
  "flow-sequence-bracket-spacing",
  rule,
  loadTestCases("flow-sequence-bracket-spacing", plugin),
);
