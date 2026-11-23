// Ported from eslint-plugin-astro v3.2.1 (MIT), src/utils/resolve-parser/espree.ts.
import type {
  ParserOptions,
  TSESTree,
} from "@typescript-eslint/types";
import * as espree from "espree";

type Espree = {
  parse(code: string, options?: ParserOptions | null): TSESTree.Program;
};

/**
 * Load `espree` bundled with this package.
 */
export function getEspree(): Espree {
  return espree as unknown as Espree;
}
