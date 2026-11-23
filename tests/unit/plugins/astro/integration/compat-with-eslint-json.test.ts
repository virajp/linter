// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/compat-with-eslint-json.ts.
import json from "@eslint/json";
import { Linter } from "eslint";
import assert from "node:assert";
import { describe, it } from "vitest";
import { groupARules } from "../../../../../src/plugins/astro/rules/group-a.js";
import { groupBRules } from "../../../../../src/plugins/astro/rules/group-b.js";

const rules = Object.values({ ...groupARules, ...groupBRules });

describe("compat with @eslint/json", () => {
  describe("should not throw error from astro rules when used with @eslint/json", () => {
    for (const rule of rules) {
      it(rule.meta.docs.ruleName, () => {
        const code = `{
          "key": "value"
        }`;
        const linter = new Linter();

        const messages = linter.verify(
          code,
          [
            {
              files: ["**/*.json", "*.json"],
              plugins: {
                json,
                astro: {
                  rules: {
                    [rule.meta.docs.ruleName]: rule as any,
                  },
                },
              },
              language: "json/json",
              rules: {
                [rule.meta.docs.ruleId]: "error",
              },
            },
          ],
          "test.json",
        );
        assert.deepStrictEqual(messages, []);
      });
    }
  });
});
