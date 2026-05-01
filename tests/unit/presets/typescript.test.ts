import {
  describe,
  expect,
  test,
} from "bun:test";
import { typescriptConfig } from "../../../src/config/presets/typescript.js";

describe("typescript preset", () => {
  test("has a name", () => {
    expect(typescriptConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(typescriptConfig.files)).toBe(true);
    expect(typescriptConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof typescriptConfig.rules).toBe("object");
  });
});
