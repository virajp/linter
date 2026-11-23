// Ported from eslint-plugin-astro v3.2.1 (MIT), src/utils/transform/sass.ts.
import type { AST } from "astro-eslint-parser";
import type { RuleContext } from "../../types.js";
import type { TransformResult } from "./types.js";
import {
  getContentRange,
  loadModule,
} from "./utils.js";

type Sass = typeof import("sass");
/**
 * Transpile with sass
 */
export function transform(
  node: AST.JSXElement,
  context: RuleContext,
  type: "scss" | "sass",
): TransformResult | null {
  const sass = loadSass(context);
  if (!sass) {
    return null;
  }
  const inputRange = getContentRange(node);
  const sourceCode = context.sourceCode;
  const code = sourceCode.text.slice(...inputRange);

  try {
    const output = sass.compileString(code, {
      sourceMap: true,
      syntax: type === "sass" ? "indented" : undefined,
    });
    if (!output) {
      return null;
    }
    return {
      inputRange,
      output: output.css,
      mappings: output.sourceMap!.mappings,
    };
  } catch {
    return null;
  }
}

/**
 * Load sass
 */
function loadSass(context: RuleContext): Sass | null {
  return loadModule(context, "sass");
}
