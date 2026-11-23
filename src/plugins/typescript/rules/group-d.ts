// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group D).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import noMeaninglessVoidOperator from "./no-meaningless-void-operator.js";
import noMisusedNew from "./no-misused-new.js";
import noMisusedPromises from "./no-misused-promises.js";
import noMisusedSpread from "./no-misused-spread.js";
import noMixedEnums from "./no-mixed-enums.js";
import noNamespace from "./no-namespace.js";
import noNonNullAssertedNullishCoalescing from "./no-non-null-asserted-nullish-coalescing.js";
import noNonNullAssertedOptionalChain from "./no-non-null-asserted-optional-chain.js";
import noNonNullAssertion from "./no-non-null-assertion.js";
import noRedeclare from "./no-redeclare.js";
import noRedundantTypeConstituents from "./no-redundant-type-constituents.js";
import noRequireImports from "./no-require-imports.js";
import noRestrictedTypes from "./no-restricted-types.js";
import noShadow from "./no-shadow.js";
import noThisAlias from "./no-this-alias.js";
import noUnnecessaryBooleanLiteralCompare from "./no-unnecessary-boolean-literal-compare.js";

export const groupDRules: Record<
  string,
  RuleModule<string, readonly unknown[], ESLintPluginDocs>
> = {
  "no-meaningless-void-operator": noMeaninglessVoidOperator,
  "no-misused-new": noMisusedNew,
  "no-misused-promises": noMisusedPromises,
  "no-misused-spread": noMisusedSpread,
  "no-mixed-enums": noMixedEnums,
  "no-namespace": noNamespace,
  "no-non-null-asserted-nullish-coalescing": noNonNullAssertedNullishCoalescing,
  "no-non-null-asserted-optional-chain": noNonNullAssertedOptionalChain,
  "no-non-null-assertion": noNonNullAssertion,
  "no-redeclare": noRedeclare,
  "no-redundant-type-constituents": noRedundantTypeConstituents,
  "no-require-imports": noRequireImports,
  "no-restricted-types": noRestrictedTypes,
  "no-shadow": noShadow,
  "no-this-alias": noThisAlias,
  "no-unnecessary-boolean-literal-compare": noUnnecessaryBooleanLiteralCompare,
};
