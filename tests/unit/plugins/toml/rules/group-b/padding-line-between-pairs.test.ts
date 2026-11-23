// Ported from eslint-plugin-toml v1.5.0 (MIT), tests/src/rules/padding-line-between-pairs.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { TOMLLanguage } from "../../../../../../src/plugins/toml/language/index.js";
import { groupBRules } from "../../../../../../src/plugins/toml/rules/group-b.js";
import rule from "../../../../../../src/plugins/toml/rules/padding-line-between-pairs.js";
import { loadTestCases } from "../../helpers/utils.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const plugin = { rules: groupBRules, languages: { toml: new TOMLLanguage() } };

const tester = new RuleTester({
  plugins: { toml: plugin },
  language: "toml/toml",
  languageOptions: {
    parserOptions: {
      tomlVersion: "next",
    },
  },
});

tester.run(
  "padding-line-between-pairs",
  rule,
  loadTestCases("padding-line-between-pairs", plugin),
);
