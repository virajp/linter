// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/auto-parser.ts.
import { parseForESLint as parseJs } from "@typescript-eslint/parser";
import type { ParserOptions } from "@typescript-eslint/types";
import { parseForESLint as parseAstro } from "astro-eslint-parser";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);

/** Change the parser used by the file name. */
export function parseForESLint(code: string, options: ParserOptions): any {
  if (options.filePath!.endsWith(".astro")) {
    return parseAstro(code, options);
  }
  return parseJs(code, options);
}

export const meta: {
  name: string;
} = {
  name: filename,
};
