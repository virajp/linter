// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/rules/no-deprecated-astro-fetchcontent.ts.
import { RuleTester } from "eslint";
import type { ESLint, Rule } from "eslint";
import { describe, it } from "vitest";
import {
  astroProcessor,
  clientSideTsProcessor,
} from "../../../../../../src/plugins/astro/processor/index.js";
import { groupARules } from "../../../../../../src/plugins/astro/rules/group-a.js";
import rule from "../../../../../../src/plugins/astro/rules/no-deprecated-astro-fetchcontent.js";
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
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      Astro: false,
    },
  },
});

tester.run(
  "no-deprecated-astro-fetchcontent",
  rule as unknown as Rule.RuleModule,
  loadTestCases("no-deprecated-astro-fetchcontent", plugin),
);
