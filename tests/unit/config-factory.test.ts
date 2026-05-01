import {
  describe,
  expect,
  test,
} from "bun:test";
import { createConfig } from "../../src/config-factory.js";

describe("createConfig", () => {
  test("returns an array", () => {
    const config = createConfig();
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
  });

  test("returns base config with no options", () => {
    const config = createConfig();
    const names = config
      .map(c => c.name)
      .filter(Boolean);
    expect(names.length).toBeGreaterThan(0);
  });

  test("adds ignores when provided", () => {
    const config = createConfig({ ignores: ["**/dist/**"] });
    const ignoresConfig = config.find(
      c =>
        c.name?.startsWith("globalIgnores")
        && c.ignores?.includes("**/dist/**"),
    );
    expect(ignoresConfig).toBeDefined();
  });

  test("applies overrides by preset name", () => {
    const config = createConfig({
      overrides: {
        typescript: {
          rules: {
            "@typescript-eslint/no-explicit-any": "error",
          },
        },
      },
    });
    const tsConfig = config.find(
      c => c.name === "typescript",
    );
    expect(tsConfig?.rules?.["@typescript-eslint/no-explicit-any"]).toBe(
      "error",
    );
  });

  test("appends extra configs when provided", () => {
    const config = createConfig({
      configs: [{ name: "custom", files: ["**/*.test.ts"], rules: {} }],
    });
    const customConfig = config.find(c => c.name === "custom");
    expect(customConfig).toBeDefined();
    expect(customConfig?.files).toEqual(["**/*.test.ts"]);
  });

  test("does not add ignores for empty array", () => {
    const baseConfig = createConfig();
    const baseIgnoresCount =
      baseConfig.filter(c => c.name?.startsWith("globalIgnores")).length;

    const config = createConfig({ ignores: [] });
    const ignoresConfigs = config.filter(c =>
      c.name?.startsWith("globalIgnores")
    );
    expect(ignoresConfigs.length).toBe(baseIgnoresCount);
  });

  test("ignores overrides for non-existent preset names", () => {
    const config = createConfig({
      overrides: {
        "non-existent-preset": {
          rules: { "some-rule": "error" },
        },
      },
    });
    expect(config.length).toBeGreaterThan(0);
  });

  test("preserves existing rules when applying overrides", () => {
    const baseConfig = createConfig();
    const tsBase = baseConfig.find(c => c.name === "typescript");
    const baseRules = { ...tsBase?.rules };

    const config = createConfig({
      overrides: {
        typescript: {
          rules: {
            "@typescript-eslint/no-explicit-any": "error",
          },
        },
      },
    });
    const tsConfig = config.find(c => c.name === "typescript");
    expect(tsConfig?.rules?.["@typescript-eslint/no-explicit-any"]).toBe(
      "error",
    );
    // Verify other rules from the base preset are still present
    const otherRuleKeys = Object.keys(baseRules).filter(
      k => k !== "@typescript-eslint/no-explicit-any",
    );
    if (otherRuleKeys.length > 0) {
      expect(tsConfig?.rules?.[otherRuleKeys[0]]).toBe(
        baseRules[otherRuleKeys[0]],
      );
    }
  });

  test("handles combined options", () => {
    const config = createConfig({
      ignores: ["**/dist/**"],
      overrides: {
        typescript: {
          rules: {
            "@typescript-eslint/no-explicit-any": "error",
          },
        },
      },
      configs: [{ name: "custom", files: ["**/*.test.ts"], rules: {} }],
    });
    expect(config.find(c => c.name === "custom")).toBeDefined();
    expect(
      config
        .find(c => c.name === "typescript")
        ?.rules
        ?.["@typescript-eslint/no-explicit-any"],
    )
      .toBe("error");
  });
});
