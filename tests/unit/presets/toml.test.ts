import {
  describe,
  expect,
  test,
} from "bun:test";
import { tomlConfig } from "../../../src/config/presets/toml.js";

describe("toml preset", () => {
  test("has a name", () => {
    expect(tomlConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(tomlConfig.files)).toBe(true);
    expect(tomlConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof tomlConfig.rules).toBe("object");
  });
});
