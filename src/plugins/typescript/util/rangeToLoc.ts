// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/rangeToLoc.ts.
import type {
  TSESLint,
  TSESTree,
} from "@typescript-eslint/utils";

export function rangeToLoc(
  sourceCode: TSESLint.SourceCode,
  range: TSESLint.AST.Range,
): TSESTree.SourceLocation {
  return {
    end: sourceCode.getLocFromIndex(range[1]),
    start: sourceCode.getLocFromIndex(range[0]),
  };
}
