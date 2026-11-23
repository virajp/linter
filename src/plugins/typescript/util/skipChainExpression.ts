// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/skipChainExpression.ts.
import type { TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

export function skipChainExpression<T extends TSESTree.Node>(
  node: T,
): T | TSESTree.ChainElement {
  return node.type === AST_NODE_TYPES.ChainExpression ? node.expression : node;
}
