// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/isHigherPrecedenceThanAwait.ts.
import * as ts from "typescript";

import { getOperatorPrecedence } from "./getOperatorPrecedence.js";

export function isHigherPrecedenceThanAwait(tsNode: ts.Node): boolean {
  const operator = ts.isBinaryExpression(tsNode)
    ? tsNode.operatorToken.kind
    : ts.SyntaxKind.Unknown;
  const nodePrecedence = getOperatorPrecedence(tsNode.kind, operator);
  const awaitPrecedence = getOperatorPrecedence(
    ts.SyntaxKind.AwaitExpression,
    ts.SyntaxKind.Unknown,
  );
  return nodePrecedence > awaitPrecedence;
}
