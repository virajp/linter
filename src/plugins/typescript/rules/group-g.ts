// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group G).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import preferAsConst from "./prefer-as-const.js";
import preferDestructuring from "./prefer-destructuring.js";
import preferEnumInitializers from "./prefer-enum-initializers.js";
import preferFind from "./prefer-find.js";
import preferForOf from "./prefer-for-of.js";
import preferFunctionType from "./prefer-function-type.js";
import preferIncludes from "./prefer-includes.js";
import preferLiteralEnumMember from "./prefer-literal-enum-member.js";
import preferNamespaceKeyword from "./prefer-namespace-keyword.js";
import preferNullishCoalescing from "./prefer-nullish-coalescing.js";
import preferOptionalChain from "./prefer-optional-chain.js";
import preferPromiseRejectErrors from "./prefer-promise-reject-errors.js";
import preferReadonlyParameterTypes from "./prefer-readonly-parameter-types.js";
import preferReadonly from "./prefer-readonly.js";
import preferReduceTypeParameter from "./prefer-reduce-type-parameter.js";
import preferRegexpExec from "./prefer-regexp-exec.js";

export const groupGRules: Record<string, RuleModule<string, readonly unknown[], ESLintPluginDocs>> = {
  "prefer-as-const": preferAsConst,
  "prefer-destructuring": preferDestructuring,
  "prefer-enum-initializers": preferEnumInitializers,
  "prefer-find": preferFind,
  "prefer-for-of": preferForOf,
  "prefer-function-type": preferFunctionType,
  "prefer-includes": preferIncludes,
  "prefer-literal-enum-member": preferLiteralEnumMember,
  "prefer-namespace-keyword": preferNamespaceKeyword,
  "prefer-nullish-coalescing": preferNullishCoalescing,
  "prefer-optional-chain": preferOptionalChain,
  "prefer-promise-reject-errors": preferPromiseRejectErrors,
  "prefer-readonly": preferReadonly,
  "prefer-readonly-parameter-types": preferReadonlyParameterTypes,
  "prefer-reduce-type-parameter": preferReduceTypeParameter,
  "prefer-regexp-exec": preferRegexpExec,
};
