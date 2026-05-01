import {
  describe,
  expect,
  test,
} from "bun:test";
import { javascriptConfig } from "../../../src/config/presets/javascript.js";

describe("javascript preset", () => {
  test("has a name", () => {
    expect(javascriptConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(javascriptConfig.files)).toBe(true);
    expect(javascriptConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof javascriptConfig.rules).toBe("object");
  });
});
