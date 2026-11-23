// Ported from eslint-plugin-astro v3.2.1 (MIT), src/utils/transform/stylus.ts.
import type { AST } from "astro-eslint-parser";
import type { RawSourceMap } from "source-map-js";
import type { RuleContext } from "../../types.js";
import type { TransformResult } from "./types.js";
import {
  getContentRange,
  loadModule,
} from "./utils.js";

type Stylus = typeof import("stylus");
/**
 * Transpile with stylus
 */
export function transform(
  node: AST.JSXElement,
  context: RuleContext,
): TransformResult | null {
  const stylus = loadStylus(context);
  if (!stylus) {
    return null;
  }
  const inputRange = getContentRange(node);
  const sourceCode = context.sourceCode;
  const code = sourceCode.text.slice(...inputRange);

  const filename = `${context.filename}.stylus`;
  try {
    let output: string | undefined;

    const style = stylus(code, {
      filename,
    })
      .set("sourcemap", {});
    style.render((_error, outputCode) => {
      output = outputCode;
    });
    if (output == null) {
      return null;
    }
    return {
      inputRange,
      output,
      mappings: (style as unknown as { sourcemap: RawSourceMap })
        .sourcemap
        .mappings,
    };
  } catch {
    return null;
  }
}

/**
 * Load stylus
 */
function loadStylus(context: RuleContext): Stylus | null {
  return loadModule(context, "stylus");
}
