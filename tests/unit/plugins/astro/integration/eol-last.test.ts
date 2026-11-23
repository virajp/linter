// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/eol-last.ts.
import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import { astroProcessor } from "../../../../../src/plugins/astro/processor/index.js";
import * as autoParser from "./auto-parser.js";
import { getCoreRule } from "./get-core-rule.js";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

describe("Integration test for eol-last", () => {
  const eolLast = getCoreRule("eol-last")!;
  const tester = new RuleTester({
    languageOptions: {
      parser: autoParser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
  });
  tester.run("eol-last", eolLast, {
    valid: [
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
        <script define:vars={{ foo: 42 }}>
          console.log(foo)
        </script>\n`,
      },

      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
        <script define:vars={{ foo: 42 }}>
          console.log(foo)
        </script>`,
        options: ["never"],
      },
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
        <script define:vars={{ foo: 42 }}>
          console.log(foo)</script>`,
        options: ["never"],
      },
    ],
    invalid: [
      {
        filename: "foo.astro",
        processor: astroProcessor,
        code: `
        <script define:vars={{ foo: 42 }}>
          console.log(foo)</script>\n`,
        output: `
        <script define:vars={{ foo: 42 }}>
          console.log(foo)
</script>\n`,
        errors: [
          {
            message: "Newline required at end of file but not found.",
            line: 3,
            column: 27,
          },
        ],
      },
    ],
  });
});
