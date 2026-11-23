// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/raw-plugin.ts.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pkg = JSON.parse(
  readFileSync(require.resolve("../../../package.json"), "utf-8"),
) as { version: string };

export const name: string = "@typescript-eslint";
export const version: string = pkg.version;
