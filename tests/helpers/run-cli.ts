import { spawn } from "node:child_process";
import { resolve } from "node:path";

const CLI_PATH = resolve(import.meta.dir, "../../dist/index.js");

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function runCli(args: string[], cwd?: string): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", [CLI_PATH, ...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", reject);
    child.on("close", exitCode => {
      resolve({ exitCode: exitCode ?? 1, stdout, stderr });
    });
  });
}

export async function runCliJson(
  args: string[],
  cwd?: string,
): Promise<Array<Record<string, unknown>>> {
  const result = await runCli([...args, "--format", "json"], cwd);
  try {
    return JSON.parse(result.stdout) as Array<Record<string, unknown>>;
  }
  catch {
    throw new Error(
      `Failed to parse JSON output. Exit code: ${result.exitCode}, stdout: ${result.stdout}, stderr: ${result.stderr}`,
    );
  }
}
