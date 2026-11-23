// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/parse-error.ts.
import { ESLint } from "eslint";
import assert from "node:assert";
import { describe, it } from "vitest";
import { baseConfig } from "./base-config.js";

describe("Integration test for parse error", () => {
  it("should work with parse error", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: baseConfig,
    });

    const result = await eslint.lintText(
      `---
const foo = true
---

<style is:inline set:html={"" >
`,
      { filePath: "path/to/test.astro" },
    );

    assert.deepStrictEqual(
      result
        .flatMap((r) => r.messages)
        .map((m) => {
          return {
            ruleId: m.ruleId,
          };
        }),
      [
        {
          ruleId: null,
        },
      ],
    );
  });
});
