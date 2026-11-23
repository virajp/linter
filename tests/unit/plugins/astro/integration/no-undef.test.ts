// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/no-undef.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { astroProcessor } from "../../../../../src/plugins/astro/processor/index.js";
import * as autoParser from "./auto-parser.js";
import { getCoreRule } from "./get-core-rule.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

describe("Integration test for no-undef", () => {
  const ruleNoUnusedVars = getCoreRule("no-undef")!;
  const tester = new RuleTester({
    languageOptions: {
      parser: autoParser,
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        console: false,
      },
    },
  });
  tester.run("no-undef", ruleNoUnusedVars, {
    valid: [
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
        <script define:vars={{ foo: 42, bar: 42 }}>
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
        <script define:vars={{ bar: 42 }}>
          console.log(foo)
        </script>
        `,
        errors: [
          {
            message: "'foo' is not defined.",
            line: 3,
            column: 23,
          },
        ],
      },
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
<script define:vars={{ bar: 42 }}>


  // empty lines
  console.log(foo)
</script>
        `,
        errors: [
          {
            message: "'foo' is not defined.",
            line: 6,
            column: 15,
          },
        ],
      },
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
<script define:vars={{ bar: 42 }}>


  // empty lines
  console.log(foo)
</script>
        `.replace(/\n/gu, "\r\n"),
        errors: [
          {
            message: "'foo' is not defined.",
            line: 6,
            column: 15,
          },
        ],
      },
    ],
  });
});
