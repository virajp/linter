// Ported from eslint-plugin-toml v1.5.0 (MIT), src/meta.ts.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pkg = JSON.parse(
  readFileSync(require.resolve("../../../package.json"), "utf-8"),
) as { version: string };

export const name = "toml";
export const version = pkg.version;
export const namespace = "toml";
