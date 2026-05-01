import {
  describe,
  expect,
  test,
} from "bun:test";
import { cssConfig } from "../../../src/config/presets/css.js";

describe("css preset", () => {
  test("has a name", () => {
    expect(cssConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(cssConfig.files)).toBe(true);
    expect(cssConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof cssConfig.rules).toBe("object");
  });
});
