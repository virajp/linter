// Ported from eslint-plugin-astro v3.2.1 (MIT), src/meta.ts.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pkg = JSON.parse(
  readFileSync(require.resolve("../../../package.json"), "utf-8"),
) as { version: string };

export const name: string = "astro";
export const version: string = pkg.version;
