import { parseArgs } from "./args.js";
import { runHelp } from "./commands/help.js";
import { runInit } from "./commands/init.js";
import { runLint } from "./commands/lint.js";
import { runVersion } from "./commands/version.js";

export async function run(rawArgs: string[]): Promise<void> {
  try {
    const args = parseArgs(rawArgs);

    if (args.flags.help) {
      runHelp();
      return;
    }

    if (args.flags.version) {
      runVersion();
      return;
    }

    if (args.flags.init) {
      runInit({ force: args.flags.force });
      return;
    }

    const exitCode = await runLint(args);
    process.exit(exitCode);
  }
  catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}
