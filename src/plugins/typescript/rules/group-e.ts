// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group E).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import noUnnecessaryCondition from "./no-unnecessary-condition.js";
import noUnnecessaryParameterPropertyAssignment from "./no-unnecessary-parameter-property-assignment.js";
import noUnnecessaryQualifier from "./no-unnecessary-qualifier.js";
import noUnnecessaryTemplateExpression from "./no-unnecessary-template-expression.js";
import noUnnecessaryTypeArguments from "./no-unnecessary-type-arguments.js";
import noUnnecessaryTypeAssertion from "./no-unnecessary-type-assertion.js";
import noUnnecessaryTypeConstraint from "./no-unnecessary-type-constraint.js";
import noUnnecessaryTypeConversion from "./no-unnecessary-type-conversion.js";
import noUnnecessaryTypeParameters from "./no-unnecessary-type-parameters.js";
import noUnsafeArgument from "./no-unsafe-argument.js";
import noUnsafeAssignment from "./no-unsafe-assignment.js";
import noUnsafeCall from "./no-unsafe-call.js";
import noUnsafeClassInstanceAssignment from "./no-unsafe-class-instance-assignment.js";
import noUnsafeDeclarationMerging from "./no-unsafe-declaration-merging.js";
import noUnsafeEnumAssignment from "./no-unsafe-enum-assignment.js";
import noUnsafeEnumComparison from "./no-unsafe-enum-comparison.js";

export const groupERules: Record<
  string,
  RuleModule<string, readonly unknown[], ESLintPluginDocs>
> = {
  "no-unnecessary-condition": noUnnecessaryCondition,
  "no-unnecessary-parameter-property-assignment": noUnnecessaryParameterPropertyAssignment,
  "no-unnecessary-qualifier": noUnnecessaryQualifier,
  "no-unnecessary-template-expression": noUnnecessaryTemplateExpression,
  "no-unnecessary-type-arguments": noUnnecessaryTypeArguments,
  "no-unnecessary-type-assertion": noUnnecessaryTypeAssertion,
  "no-unnecessary-type-constraint": noUnnecessaryTypeConstraint,
  "no-unnecessary-type-conversion": noUnnecessaryTypeConversion,
  "no-unnecessary-type-parameters": noUnnecessaryTypeParameters,
  "no-unsafe-argument": noUnsafeArgument,
  "no-unsafe-assignment": noUnsafeAssignment,
  "no-unsafe-call": noUnsafeCall,
  "no-unsafe-class-instance-assignment": noUnsafeClassInstanceAssignment,
  "no-unsafe-declaration-merging": noUnsafeDeclarationMerging,
  "no-unsafe-enum-assignment": noUnsafeEnumAssignment,
  "no-unsafe-enum-comparison": noUnsafeEnumComparison,
};
