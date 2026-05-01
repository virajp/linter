import { runLint } from "../../src/cli/commands/lint.js";
import type { CliArgs } from "../../src/cli/types.js";

/**
 * Directly invoke runLint() for unit tests.
 * Note: This has side effects (console output, reads process.cwd).
 * Use in temp directories for isolation.
 */
export async function runLintUnit(args: CliArgs): Promise<number> {
  return runLint(args);
}
