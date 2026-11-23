// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group F).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import noUnsafeFunctionType from "./no-unsafe-function-type.js";
import noUnsafeMemberAccess from "./no-unsafe-member-access.js";
import noUnsafeReturn from "./no-unsafe-return.js";
import noUnsafeTypeAssertion from "./no-unsafe-type-assertion.js";
import noUnsafeUnaryMinus from "./no-unsafe-unary-minus.js";
import noUnusedExpressions from "./no-unused-expressions.js";
import noUnusedPrivateClassMembers from "./no-unused-private-class-members.js";
import noUnusedVars from "./no-unused-vars.js";
import noUseBeforeDefine from "./no-use-before-define.js";
import noUselessConstructor from "./no-useless-constructor.js";
import noUselessDefaultAssignment from "./no-useless-default-assignment.js";
import noUselessEmptyExport from "./no-useless-empty-export.js";
import noWrapperObjectTypes from "./no-wrapper-object-types.js";
import nonNullableTypeAssertionStyle from "./non-nullable-type-assertion-style.js";
import onlyThrowError from "./only-throw-error.js";
import parameterProperties from "./parameter-properties.js";

export const groupFRules: Record<string, RuleModule<string, readonly unknown[], ESLintPluginDocs>> = {
  "no-unsafe-function-type": noUnsafeFunctionType,
  "no-unsafe-member-access": noUnsafeMemberAccess,
  "no-unsafe-return": noUnsafeReturn,
  "no-unsafe-type-assertion": noUnsafeTypeAssertion,
  "no-unsafe-unary-minus": noUnsafeUnaryMinus,
  "no-unused-expressions": noUnusedExpressions,
  "no-unused-private-class-members": noUnusedPrivateClassMembers,
  "no-unused-vars": noUnusedVars,
  "no-use-before-define": noUseBeforeDefine,
  "no-useless-constructor": noUselessConstructor,
  "no-useless-default-assignment": noUselessDefaultAssignment,
  "no-useless-empty-export": noUselessEmptyExport,
  "no-wrapper-object-types": noWrapperObjectTypes,
  "non-nullable-type-assertion-style": nonNullableTypeAssertionStyle,
  "only-throw-error": onlyThrowError,
  "parameter-properties": parameterProperties,
};
