// Ported from eslint-plugin-toml v1.5.0 (MIT), tests/src/rules/keys-order.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { TOMLLanguage } from "../../../../../../src/plugins/toml/language/index.js";
import { groupARules } from "../../../../../../src/plugins/toml/rules/group-a.js";
import rule from "../../../../../../src/plugins/toml/rules/keys-order.js";
import { loadTestCases } from "../../helpers/utils.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const plugin = { rules: groupARules, languages: { toml: new TOMLLanguage() } };

const tester = new RuleTester({
  plugins: { toml: plugin },
  language: "toml/toml",
  languageOptions: {
    parserOptions: {
      tomlVersion: "next",
    },
  },
});

tester.run("keys-order", rule, loadTestCases("keys-order", plugin));
