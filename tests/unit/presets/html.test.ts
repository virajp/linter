import {
  describe,
  expect,
  test,
} from "bun:test";
import { htmlConfig } from "../../../src/config/presets/html.js";

describe("html preset", () => {
  test("has a name", () => {
    expect(htmlConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(htmlConfig.files)).toBe(true);
    expect(htmlConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof htmlConfig.rules).toBe("object");
  });
});
