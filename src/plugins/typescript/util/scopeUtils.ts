// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/scopeUtils.ts.
import type { TSESTree } from "@typescript-eslint/utils";
import type { SourceCode } from "@typescript-eslint/utils/ts-eslint";

export function isReferenceToGlobalFunction(
  calleeName: string,
  node: TSESTree.Node,
  sourceCode: SourceCode,
): boolean {
  const ref = sourceCode
    .getScope(node)
    .references
    .find((ref) => ref.identifier.name === calleeName);

  // ensure it's the "global" version
  return !ref?.resolved?.defs.length;
}
