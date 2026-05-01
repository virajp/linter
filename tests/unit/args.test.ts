import {
  describe,
  expect,
  test,
} from "bun:test";
import { parseArgs } from "../../src/cli/args.js";
import { ParseError } from "../../src/cli/types.js";

describe("parseArgs", () => {
  test("parses --fix", () => {
    const result = parseArgs(["--fix", "src/"]);
    expect(result.flags.fix).toBe(true);
    expect(result.positional).toEqual(["src/"]);
  });

  test("parses --cache", () => {
    const result = parseArgs(["--cache"]);
    expect(result.flags.cache).toBe(true);
  });

  test("parses --quiet", () => {
    const result = parseArgs(["--quiet"]);
    expect(result.flags.quiet).toBe(true);
  });

  test("parses --no-ignore", () => {
    const result = parseArgs(["--no-ignore"]);
    expect(result.flags.ignore).toBe(false);
  });

  test("parses --debug", () => {
    const result = parseArgs(["--debug"]);
    expect(result.flags.debug).toBe(true);
  });

  test("parses --version and -v", () => {
    expect(parseArgs(["--version"]).flags.version).toBe(true);
    expect(parseArgs(["-v"]).flags.version).toBe(true);
  });

  test("parses --help and -h", () => {
    expect(parseArgs(["--help"]).flags.help).toBe(true);
    expect(parseArgs(["-h"]).flags.help).toBe(true);
  });

  test("parses --init", () => {
    const result = parseArgs(["--init"]);
    expect(result.flags.init).toBe(true);
  });

  test("parses --force", () => {
    const result = parseArgs(["--init", "--force"]);
    expect(result.flags.force).toBe(true);
  });

  test("parses --cache-location", () => {
    const result = parseArgs(["--cache-location", "/tmp/cache"]);
    expect(result.cacheLocation).toBe("/tmp/cache");
  });

  test("throws on missing --cache-location value", () => {
    expect(() => parseArgs(["--cache-location"])).toThrow(
      new ParseError("--cache-location requires a path argument"),
    );
  });

  test("parses --format", () => {
    const result = parseArgs(["--format", "json"]);
    expect(result.format).toBe("json");
  });

  test("parses -f as --format", () => {
    const result = parseArgs(["-f", "compact"]);
    expect(result.format).toBe("compact");
  });

  test("throws on missing --format value", () => {
    expect(() => parseArgs(["--format"])).toThrow(
      new ParseError("--format requires a format name"),
    );
  });

  test("parses --max-warnings", () => {
    const result = parseArgs(["--max-warnings", "5"]);
    expect(result.maxWarnings).toBe(5);
  });

  test("throws on invalid --max-warnings value", () => {
    expect(() => parseArgs(["--max-warnings", "abc"])).toThrow(
      new ParseError("--max-warnings requires a number"),
    );
  });

  test("throws on missing --max-warnings value", () => {
    expect(() => parseArgs(["--max-warnings"])).toThrow(
      new ParseError("--max-warnings requires a number"),
    );
  });

  test("parses positional args", () => {
    const result = parseArgs(["src/", "lib/"]);
    expect(result.positional).toEqual(["src/", "lib/"]);
  });

  test("defaults positional to empty array", () => {
    const result = parseArgs([]);
    expect(result.positional).toEqual([]);
  });

  test("throws on unknown flags", () => {
    expect(() => parseArgs(["--unknown"])).toThrow(
      new ParseError("Unknown flag: --unknown"),
    );
  });

  test("parses -- separator", () => {
    const result = parseArgs(["--", "--some-flag", "file.js"]);
    expect(result.positional).toEqual(["--some-flag", "file.js"]);
  });

  test("default flag values", () => {
    const result = parseArgs([]);
    expect(result.flags).toEqual({
      init: false,
      force: false,
      fix: false,
      cache: false,
      quiet: false,
      ignore: true,
      debug: false,
      version: false,
      help: false,
    });
    expect(result.cacheLocation).toBeUndefined();
    expect(result.format).toBeUndefined();
    expect(result.maxWarnings).toBeUndefined();
    expect(result.positional).toEqual([]);
  });
});
