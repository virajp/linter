import { ESLint } from "eslint";
import { createRequire } from "node:module";
import { createConfig } from "../../config-factory.js";
import { loadYamlOptions } from "../../config-loader.js";
import type { CliArgs } from "../types.js";

const require = createRequire(import.meta.url);

export async function runLint(args: CliArgs): Promise<number> {
  if (args.flags.debug) {
    const debug = require("debug");
    debug.enable("eslint:*,-eslint:code-path,eslintrc:*");
  }

  const targets = args.positional.length > 0 ? args.positional : ["."];
  const config = createConfig(loadYamlOptions(process.cwd()));

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config,
    fix: args.flags.fix,
    cache: args.flags.cache,
    cacheLocation: args.cacheLocation,
    errorOnUnmatchedPattern: false,
    ignore: args.flags.ignore,
  });

  let results;
  try {
    results = await eslint.lintFiles(targets);
  }
  catch (e) {
    throw new Error(e instanceof Error ? e.message : String(e), { cause: e });
  }

  if (args.flags.fix) {
    await ESLint.outputFixes(results);
  }

  if (args.flags.quiet) {
    results = ESLint.getErrorResults(results);
  }

  const formatter = await eslint.loadFormatter(args.format);
  const output = await formatter.format(results);
  if (output) {
    console.log(output);
  }

  const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
  const failed = errorCount > 0
    || (args.maxWarnings !== undefined
      && args.maxWarnings >= 0
      && warningCount > args.maxWarnings);

  return failed ? 1 : 0;
}
