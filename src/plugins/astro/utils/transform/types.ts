// Ported from eslint-plugin-astro v3.2.1 (MIT), src/utils/transform/types.ts.
import type { AST } from "astro-eslint-parser";
export type TransformResult = {
  inputRange: AST.Range;
  output: string;
  mappings: string;
};
