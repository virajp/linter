// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/linebreak-style.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { astroProcessor } from "../../../../../src/plugins/astro/processor/index.js";
import * as autoParser from "./auto-parser.js";
import { getCoreRule } from "./get-core-rule.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

describe("Integration test for linebreak-style", () => {
  const ruleNoUnusedVars = getCoreRule("linebreak-style")!;
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
  tester.run("linebreak-style", ruleNoUnusedVars, {
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
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
<script define:vars={{ bar: 42 }}>


  // empty lines
  console.log(foo)
</script>
        `,
      },
    ],
    invalid: [
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `{/*eslint rule-to-test/linebreak-style:0*/}
        <script define:vars={{ bar: 42 }}>
          console.log(foo)\r
        </script>
        `,
        output: `{/*eslint rule-to-test/linebreak-style:0*/}
        <script define:vars={{ bar: 42 }}>
          console.log(foo)
        </script>
        `,
        errors: 1,
      },
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `{/*eslint rule-to-test/linebreak-style:0*/}
<script define:vars={{ bar: 42 }}>\r
\r
\r
  // empty lines\r
  console.log(foo)\r
</script>
        `,
        output: `{/*eslint rule-to-test/linebreak-style:0*/}
<script define:vars={{ bar: 42 }}>\r

\r
  // empty lines
  console.log(foo)
</script>
        `,
        errors: 4,
      },
    ],
  });
});
