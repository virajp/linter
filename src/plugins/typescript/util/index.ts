// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/index.ts.
import { ESLintUtils } from "@typescript-eslint/utils";

export * from "./astUtils.js";
export * from "./baseTypeUtils.js";
export * from "./collectUnusedVariables.js";
export * from "./createRule.js";
export * from "./FunctionSignature.js";
export * from "./getAwaitTokenRemovalRange.js";
export * from "./getBaseTypesOfClassMember.js";
export * from "./getConstraintInfo.js";
export * from "./getFixOrSuggest.js";
export * from "./getFunctionHeadLoc.js";
export * from "./getOperatorPrecedence.js";
export * from "./getStaticStringValue.js";
export * from "./getStringLength.js";
export * from "./getTextWithParentheses.js";
export * from "./getThisExpression.js";
export * from "./getValueOfLiteralType.js";
export * from "./getWrappingFixer.js";
export * from "./hasOverloadSignatures.js";
export * from "./isArrayMethodCallWithPredicate.js";
export * from "./isAssignee.js";
export * from "./isConditionalTest.js";
export * from "./isHigherPrecedenceThanAwait.js";
export * from "./isNodeEqual.js";
export * from "./isNullLiteral.js";
export * from "./isStartOfArrowFunctionBodyNeedingParentheses.js";
export * from "./isStartOfExpressionStatement.js";
export * from "./isStartOfExpressionStatementNeedingParentheses.js";
export * from "./isUndefinedIdentifier.js";
export * from "./misc.js";
export * from "./needsPrecedingSemiColon.js";
export * from "./needsToBeAwaited.js";
export * from "./objectIterators.js";
export * from "./scopeUtils.js";
export * from "./skipChainExpression.js";
export * from "./truthinessUtils.js";
export * from "./types.js";
export * from "./walkStatements.js";

// this is done for convenience - saves migrating all of the old rules
export * from "@typescript-eslint/type-utils";

export const {
  applyDefault,
  deepMerge,
  getParserServices,
  isObjectNotArray,
  nullThrows,
  NullThrowsReasons,
} = ESLintUtils;
export type InferMessageIdsTypeFromRule<T> = ESLintUtils.InferMessageIdsTypeFromRule<T>;
export type InferOptionsTypeFromRule<T> = ESLintUtils.InferOptionsTypeFromRule<T>;
