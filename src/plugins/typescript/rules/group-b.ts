// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group B).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import explicitFunctionReturnType from "./explicit-function-return-type.js";
import explicitMemberAccessibility from "./explicit-member-accessibility.js";
import explicitModuleBoundaryTypes from "./explicit-module-boundary-types.js";
import initDeclarations from "./init-declarations.js";
import maxParams from "./max-params.js";
import memberOrdering from "./member-ordering.js";
import methodSignatureStyle from "./method-signature-style.js";
import namingConvention from "./naming-convention.js";
import noArrayConstructor from "./no-array-constructor.js";
import noArrayDelete from "./no-array-delete.js";
import noBaseToString from "./no-base-to-string.js";
import noConfusingNonNullAssertion from "./no-confusing-non-null-assertion.js";
import noConfusingVoidExpression from "./no-confusing-void-expression.js";
import noDeprecated from "./no-deprecated.js";
import noDupeClassMembers from "./no-dupe-class-members.js";
import noDuplicateEnumValues from "./no-duplicate-enum-values.js";

export const groupBRules: Record<string, RuleModule<string, readonly unknown[], ESLintPluginDocs>> = {
  "explicit-function-return-type": explicitFunctionReturnType,
  "explicit-member-accessibility": explicitMemberAccessibility,
  "explicit-module-boundary-types": explicitModuleBoundaryTypes,
  "init-declarations": initDeclarations,
  "max-params": maxParams,
  "member-ordering": memberOrdering,
  "method-signature-style": methodSignatureStyle,
  "naming-convention": namingConvention,
  "no-array-constructor": noArrayConstructor,
  "no-array-delete": noArrayDelete,
  "no-base-to-string": noBaseToString,
  "no-confusing-non-null-assertion": noConfusingNonNullAssertion,
  "no-confusing-void-expression": noConfusingVoidExpression,
  "no-deprecated": noDeprecated,
  "no-dupe-class-members": noDupeClassMembers,
  "no-duplicate-enum-values": noDuplicateEnumValues,
};
