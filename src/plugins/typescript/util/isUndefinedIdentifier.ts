// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/isUndefinedIdentifier.ts.
import type { TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

export function isUndefinedIdentifier(i: TSESTree.Node): boolean {
  return i.type === AST_NODE_TYPES.Identifier && i.name === "undefined";
}
