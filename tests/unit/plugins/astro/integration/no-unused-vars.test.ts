// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/no-unused-vars.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { astroProcessor } from "../../../../../src/plugins/astro/processor/index.js";
import * as autoParser from "./auto-parser.js";
import { getCoreRule } from "./get-core-rule.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

describe("Integration test for no-unused-vars", () => {
  const ruleNoUnusedVars = getCoreRule("no-unused-vars")!;
  const tester = new RuleTester({
    languageOptions: {
      parser: autoParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
  });
  tester.run("no-unused-vars", ruleNoUnusedVars, {
    valid: [
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
        <script define:vars={{ foo: 42 }}>
          console.log(foo)
        </script>
        `,
      },
    ],
    invalid: [
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
        <script define:vars={{ foo: 42, bar: 42 }}>
          console.log(foo)
        </script>
        `,
        errors: [
          {
            message: "'bar' is defined but never used.",
            line: 2,
            column: 41,
          },
        ],
      },
    ],
  });
});
