// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/isStartOfExpressionStatementNeedingParentheses.ts.
import type { TSESTree } from "@typescript-eslint/utils";

import { isStartOfExpressionStatement } from "./isStartOfExpressionStatement.js";

export function isStartOfExpressionStatementNeedingParentheses(
  node: TSESTree.Node,
  firstToken: TSESTree.Token,
): boolean {
  return (
    ["{", "class", "function"].includes(firstToken.value)
    && isStartOfExpressionStatement(node)
  );
}
