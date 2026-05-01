import type { CliArgs } from "./types.js";
import { ParseError } from "./types.js";

export function parseArgs(rawArgs: string[]): CliArgs {
  const flags: CliArgs["flags"] = {
    init: false,
    force: false,
    fix: false,
    cache: false,
    quiet: false,
    ignore: true,
    debug: false,
    version: false,
    help: false,
  };
  let cacheLocation: string | undefined;
  let format: string | undefined;
  let maxWarnings: number | undefined;
  const positional: string[] = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === undefined) {
      break;
    }
    switch (arg) {
      case "--init":
        flags.init = true;
        break;
      case "--force":
        flags.force = true;
        break;
      case "--fix":
        flags.fix = true;
        break;
      case "--cache":
        flags.cache = true;
        break;
      case "--quiet":
        flags.quiet = true;
        break;
      case "--no-ignore":
        flags.ignore = false;
        break;
      case "--debug":
        flags.debug = true;
        break;
      case "--version":
      case "-v":
        flags.version = true;
        break;
      case "--help":
      case "-h":
        flags.help = true;
        break;
      case "--cache-location": {
        const next = rawArgs[++i];
        if (!next) {
          throw new ParseError("--cache-location requires a path argument");
        }
        cacheLocation = next;
        break;
      }
      case "--format":
      case "-f": {
        const next = rawArgs[++i];
        if (!next) {
          throw new ParseError("--format requires a format name");
        }
        format = next;
        break;
      }
      case "--max-warnings": {
        const next = rawArgs[++i];
        if (!next || Number.isNaN(Number(next))) {
          throw new ParseError("--max-warnings requires a number");
        }
        maxWarnings = Number(next);
        break;
      }
      case "--":
        for (let j = i + 1; j < rawArgs.length; j++) {
          const remaining = rawArgs[j];
          if (remaining !== undefined) {
            positional.push(remaining);
          }
        }
        i = rawArgs.length;
        break;
      default:
        if (arg.startsWith("-")) {
          throw new ParseError(`Unknown flag: ${arg}`);
        }
        positional.push(arg);
        break;
    }
  }

  return { flags, cacheLocation, format, maxWarnings, positional };
}
