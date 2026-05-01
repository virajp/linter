import {
  describe,
  expect,
  test,
} from "bun:test";
import { yamlConfig } from "../../../src/config/presets/yaml.js";

describe("yaml preset", () => {
  test("has a name", () => {
    expect(yamlConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(yamlConfig.files)).toBe(true);
    expect(yamlConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof yamlConfig.rules).toBe("object");
  });
});
