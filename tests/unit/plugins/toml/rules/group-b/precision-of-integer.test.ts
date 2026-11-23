// Ported from eslint-plugin-toml v1.5.0 (MIT), tests/src/rules/precision-of-integer.ts.
import assert from "node:assert";
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { maxBitToMaxValues } from "../../../../../../src/plugins/toml/utils/bit.js";
import { TOMLLanguage } from "../../../../../../src/plugins/toml/language/index.js";
import { groupBRules } from "../../../../../../src/plugins/toml/rules/group-b.js";
import rule from "../../../../../../src/plugins/toml/rules/precision-of-integer.js";
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

tester.run("precision-of-integer", rule, loadTestCases("precision-of-integer", plugin));

if (typeof BigInt !== "undefined") {
  const one = BigInt("1");
  const minusOne = BigInt("-1");
  describe("Test for precision-of-integer.maxBitToMaxValues.", () => {
    for (let bit = 1; bit <= 128; bit++) {
      it(`The result of ${bit} should be the expected value.`, () => {
        const maxValues = maxBitToMaxValues(bit);
        const plus = BigInt(maxValues["+"]);
        const minus = BigInt(maxValues["-"]);

        assert.strictEqual(minus * minusOne, BigInt.asIntN(bit, plus + one));
        assert.strictEqual(minus, BigInt(`0x${maxValues["0x"]}`));
        assert.strictEqual(minus, BigInt(`0o${maxValues["0o"]}`));
        assert.strictEqual(minus, BigInt(`0b${maxValues["0b"]}`));
      });
    }
  });
}
