// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/index.js.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const pkg = JSON.parse(
  readFileSync(require.resolve("../../../package.json"), "utf-8"),
) as { version: string };

export const name = "html";
export const version = pkg.version;
