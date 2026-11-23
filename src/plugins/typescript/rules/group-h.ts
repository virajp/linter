// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group H).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import preferReturnThisType from "./prefer-return-this-type.js";
import preferStringStartsEndsWith from "./prefer-string-starts-ends-with.js";
import promiseFunctionAsync from "./promise-function-async.js";
import relatedGetterSetterPairs from "./related-getter-setter-pairs.js";
import requireArraySortCompare from "./require-array-sort-compare.js";
import requireAwait from "./require-await.js";
import restrictPlusOperands from "./restrict-plus-operands.js";
import restrictTemplateExpressions from "./restrict-template-expressions.js";
import returnAwait from "./return-await.js";
import strictBooleanExpressions from "./strict-boolean-expressions.js";
import strictVoidReturn from "./strict-void-return.js";
import switchExhaustivenessCheck from "./switch-exhaustiveness-check.js";
import tripleSlashReference from "./triple-slash-reference.js";
import unboundMethod from "./unbound-method.js";
import unifiedSignatures from "./unified-signatures.js";
import useUnknownInCatchCallbackVariable from "./use-unknown-in-catch-callback-variable.js";

export const groupHRules: Record<
  string,
  RuleModule<string, readonly unknown[], ESLintPluginDocs>
> = {
  "prefer-return-this-type": preferReturnThisType,
  "prefer-string-starts-ends-with": preferStringStartsEndsWith,
  "promise-function-async": promiseFunctionAsync,
  "related-getter-setter-pairs": relatedGetterSetterPairs,
  "require-array-sort-compare": requireArraySortCompare,
  "require-await": requireAwait,
  "restrict-plus-operands": restrictPlusOperands,
  "restrict-template-expressions": restrictTemplateExpressions,
  "return-await": returnAwait,
  "strict-boolean-expressions": strictBooleanExpressions,
  "strict-void-return": strictVoidReturn,
  "switch-exhaustiveness-check": switchExhaustivenessCheck,
  "triple-slash-reference": tripleSlashReference,
  "unbound-method": unboundMethod,
  "unified-signatures": unifiedSignatures,
  "use-unknown-in-catch-callback-variable": useUnknownInCatchCallbackVariable,
};
