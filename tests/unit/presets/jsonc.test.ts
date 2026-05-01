import {
  describe,
  expect,
  test,
} from "bun:test";
import { jsoncConfig } from "../../../src/config/presets/jsonc.js";

describe("jsonc preset", () => {
  test("has a name", () => {
    expect(jsoncConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(jsoncConfig.files)).toBe(true);
    expect(jsoncConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof jsoncConfig.rules).toBe("object");
  });
});
