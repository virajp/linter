// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/client-typescript.ts.
import tsESLintParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import assert from "node:assert";
import { describe, it } from "vitest";
import { baseConfig } from "./base-config.js";

describe("Integration test for client-side ts", () => {
  it("should work with client-side-ts processor", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        ...baseConfig,
        {
          files: ["*.ts", "**/*.ts"],
          languageOptions: {
            parser: tsESLintParser,
          },
          rules: {
            "no-restricted-syntax": ["error", "TSTypeAnnotation"],
          } as Record<string, any>,
          // Auto detect the processor
          // processor: "astro/client-side-ts",
        },
      ],
    });

    const result = await eslint.lintText(
      `
      <script>
      const map: Map<string, string> = new Map<string, string>()
      </script>
      `,
      { filePath: "path/to/test.astro" },
    );

    assert.deepStrictEqual(
      result
        .flatMap((r) => r.messages)
        .map((m) => ({ ruleId: m.ruleId, message: m.message })),
      [
        {
          message: "Using 'TSTypeAnnotation' is not allowed.",
          ruleId: "no-restricted-syntax",
        },
      ],
    );
  });

  it("should work with self-closing script", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        ...baseConfig,
        {
          files: ["*.ts", "**/*.ts"],
          languageOptions: {
            parser: tsESLintParser,
          },
        },
      ],
    });

    const result = await eslint.lintText(
      `
      <script src="something.ts" />
      `,
      { filePath: "path/to/test.astro" },
    );

    assert.deepStrictEqual(
      result
        .flatMap((r) => r.messages)
        .map((m) => ({ ruleId: m.ruleId, message: m.message })),
      [],
    );
  });
});
