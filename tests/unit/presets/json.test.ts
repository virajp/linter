import {
  describe,
  expect,
  test,
} from "bun:test";
import { jsonConfig } from "../../../src/config/presets/json.js";

describe("json preset", () => {
  test("has a name", () => {
    expect(jsonConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(jsonConfig.files)).toBe(true);
    expect(jsonConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof jsonConfig.rules).toBe("object");
  });
});
