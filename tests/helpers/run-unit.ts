import { runLint } from "../../src/cli/commands/lint.js";
import type { CliArgs } from "../../src/cli/types.js";

export async function runLintInternal(args: CliArgs): Promise<number> {
  return runLint(args);
}
