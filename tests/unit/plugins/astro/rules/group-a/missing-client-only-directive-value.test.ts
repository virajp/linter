// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/rules/missing-client-only-directive-value.ts.
import { RuleTester } from "eslint";
import type { ESLint, Rule } from "eslint";
import { describe, it } from "vitest";
import {
  astroProcessor,
  clientSideTsProcessor,
} from "../../../../../../src/plugins/astro/processor/index.js";
import { groupARules } from "../../../../../../src/plugins/astro/rules/group-a.js";
import rule from "../../../../../../src/plugins/astro/rules/missing-client-only-directive-value.js";
import { loadTestCases } from "../../helpers/utils.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const plugin = {
  rules: groupARules,
  processors: {
    ".astro": astroProcessor,
    astro: astroProcessor,
    "client-side-ts": clientSideTsProcessor,
  },
} as unknown as ESLint.Plugin;

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run(
  "missing-client-only-directive-value",
  rule as unknown as Rule.RuleModule,
  loadTestCases("missing-client-only-directive-value", plugin),
);
