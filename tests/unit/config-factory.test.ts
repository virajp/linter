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
});
