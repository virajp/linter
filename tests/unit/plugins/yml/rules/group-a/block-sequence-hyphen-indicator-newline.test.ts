// Ported from eslint-plugin-yml v3.10.0 (MIT), tests/src/rules/block-sequence-hyphen-indicator-newline.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { YAMLLanguage } from "../../../../../../src/plugins/yml/language/index.js";
import { groupARules } from "../../../../../../src/plugins/yml/rules/group-a.js";
import rule from "../../../../../../src/plugins/yml/rules/block-sequence-hyphen-indicator-newline.js";
import { loadTestCases } from "../../helpers/utils.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const plugin = { rules: groupARules, languages: { yaml: new YAMLLanguage() } };

const tester = new RuleTester({});

tester.run(
  "block-sequence-hyphen-indicator-newline",
  rule,
  loadTestCases("block-sequence-hyphen-indicator-newline", plugin),
);
