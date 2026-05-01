import {
  describe,
  expect,
  test,
} from "bun:test";
import { markdownConfig } from "../../../src/config/presets/markdown.js";

describe("markdown preset", () => {
  test("has a name", () => {
    expect(markdownConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(markdownConfig.files)).toBe(true);
    expect(markdownConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof markdownConfig.rules).toBe("object");
  });
});
