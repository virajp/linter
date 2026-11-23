// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/rules/no-unused-define-vars-in-style.ts.
import type { ESLint, Rule } from "eslint";
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import {
  astroProcessor,
  clientSideTsProcessor,
} from "../../../../../../src/plugins/astro/processor/index.js";
import { groupBRules } from "../../../../../../src/plugins/astro/rules/group-b.js";
import rule from "../../../../../../src/plugins/astro/rules/no-unused-define-vars-in-style.js";
import { loadTestCases } from "../../helpers/utils.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const plugin = {
  rules: groupBRules,
  processors: {
    "client-side-ts": clientSideTsProcessor,
    astro: astroProcessor,
    ".astro": astroProcessor,
  },
} as unknown as ESLint.Plugin;

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run(
  "no-unused-define-vars-in-style",
  rule as unknown as Rule.RuleModule,
  loadTestCases("no-unused-define-vars-in-style", plugin),
);
