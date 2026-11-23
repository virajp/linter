// Ported from eslint-plugin-astro v3.2.1 (MIT), src/utils/transform/less.ts.
import type { AST } from "astro-eslint-parser";
import type { RuleContext } from "../../types.js";
import type { TransformResult } from "./types.js";
import {
  getContentRange,
  loadModule,
} from "./utils.js";

type Less = typeof import("less");
/**
 * Transpile with less
 */
export function transform(
  node: AST.JSXElement,
  context: RuleContext,
): TransformResult | null {
  const less = loadLess(context);
  if (!less) {
    return null;
  }
  const inputRange = getContentRange(node);

  const sourceCode = context.sourceCode;
  const code = sourceCode.text.slice(...inputRange);

  const filename = `${context.filename}.less`;
  try {
    let output: Awaited<ReturnType<Less["render"]>> | undefined;

    less.render(
      code,
      {
        sourceMap: {},
        syncImport: true,
        filename,
        lint: false,
      },
      (_error, result) => {
        output = result;
      },
    );
    if (!output) {
      return null;
    }
    return {
      inputRange,
      output: output.css,
      mappings: JSON.parse(output.map).mappings,
    };
  } catch {
    return null;
  }
}

/**
 * Load less
 */
function loadLess(context: RuleContext): Less | null {
  return loadModule(context, "less");
}
