import {
  describe,
  expect,
  test,
} from "bun:test";
import { astroConfig } from "../../../src/config/presets/astro.js";

describe("astro preset", () => {
  test("has a name", () => {
    expect(astroConfig.name).toBeDefined();
  });

  test("has files array", () => {
    expect(Array.isArray(astroConfig.files)).toBe(true);
    expect(astroConfig.files!.length).toBeGreaterThan(0);
  });

  test("has rules object", () => {
    expect(typeof astroConfig.rules).toBe("object");
  });
});
