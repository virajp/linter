// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/getWrappedCode.ts.
import type { OperatorPrecedence } from "./getOperatorPrecedence.js";

export function getWrappedCode(
  text: string,
  nodePrecedence: OperatorPrecedence,
  parentPrecedence: OperatorPrecedence,
): string {
  return nodePrecedence > parentPrecedence ? text : `(${text})`;
}
