import { ESLint } from "eslint";
import { createRequire } from "node:module";
import { createConfig } from "../../config-factory.js";
import { loadYamlOptions } from "../../config-loader.js";
import { markdownProcessorConfig } from "../../config/markdown-processor.js";
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

  let results = await lintFiles(eslint, targets);

  if (args.flags.fix) {
    await ESLint.outputFixes(results);
  }

  // Second pass: the fenced code blocks of every Markdown file that the first
  // pass linted (see markdown-processor.ts). It runs after the first pass has
  // written its fixes, and it does not use the cache, so the two configs never
  // share cache entries.
  const markdownFiles: string[] = [];
  for (const { filePath } of results) {
    if (filePath.endsWith(".md") && !(await eslint.isPathIgnored(filePath))) {
      markdownFiles.push(filePath);
    }
  }
  if (markdownFiles.length > 0) {
    const codeBlocks = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [...config, markdownProcessorConfig],
      fix: args.flags.fix,
      errorOnUnmatchedPattern: false,
      ignore: args.flags.ignore,
    });
    const blockResults = await lintFiles(codeBlocks, markdownFiles);
    if (args.flags.fix) {
      await ESLint.outputFixes(blockResults);
    }
    results = mergeResults(results, blockResults);
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

async function lintFiles(
  eslint: ESLint,
  targets: string[],
): Promise<ESLint.LintResult[]> {
  try {
    return await eslint.lintFiles(targets);
  }
  catch (e) {
    throw new Error(e instanceof Error ? e.message : String(e), { cause: e });
  }
}

// Folds each code-block result into the result of the same file, so that a
// Markdown file appears once in the report with all of its problems.
function mergeResults(
  results: ESLint.LintResult[],
  extra: ESLint.LintResult[],
): ESLint.LintResult[] {
  const byPath = new Map(extra.map(r => [r.filePath, r]));
  return results.map(r => {
    const e = byPath.get(r.filePath);
    if (!e) {
      return r;
    }
    return {
      ...r,
      messages: [...r.messages, ...e.messages].sort((a, b) =>
        a.line - b.line || a.column - b.column
      ),
      suppressedMessages: [...r.suppressedMessages, ...e.suppressedMessages],
      errorCount: r.errorCount + e.errorCount,
      fatalErrorCount: r.fatalErrorCount + e.fatalErrorCount,
      warningCount: r.warningCount + e.warningCount,
      fixableErrorCount: r.fixableErrorCount + e.fixableErrorCount,
      fixableWarningCount: r.fixableWarningCount + e.fixableWarningCount,
      usedDeprecatedRules: [...r.usedDeprecatedRules, ...e.usedDeprecatedRules],
    };
  });
}
