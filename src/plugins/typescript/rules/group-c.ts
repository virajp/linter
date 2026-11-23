// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group C).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import noDuplicateTypeConstituents from "./no-duplicate-type-constituents.js";
import noDynamicDelete from "./no-dynamic-delete.js";
import noEmptyFunction from "./no-empty-function.js";
import noEmptyObjectType from "./no-empty-object-type.js";
import noExplicitAny from "./no-explicit-any.js";
import noExtraNonNullAssertion from "./no-extra-non-null-assertion.js";
import noExtraneousClass from "./no-extraneous-class.js";
import noFloatingPromises from "./no-floating-promises.js";
import noForInArray from "./no-for-in-array.js";
import noGeneratedEmptyObjectType from "./no-generated-empty-object-type.js";
import noImpliedEval from "./no-implied-eval.js";
import noImportTypeSideEffects from "./no-import-type-side-effects.js";
import noInferrableTypes from "./no-inferrable-types.js";
import noInvalidThis from "./no-invalid-this.js";
import noInvalidVoidType from "./no-invalid-void-type.js";
import noMagicNumbers from "./no-magic-numbers.js";

export const groupCRules: Record<
  string,
  RuleModule<string, readonly unknown[], ESLintPluginDocs>
> = {
  "no-duplicate-type-constituents": noDuplicateTypeConstituents,
  "no-dynamic-delete": noDynamicDelete,
  "no-empty-function": noEmptyFunction,
  "no-empty-object-type": noEmptyObjectType,
  "no-explicit-any": noExplicitAny,
  "no-extra-non-null-assertion": noExtraNonNullAssertion,
  "no-extraneous-class": noExtraneousClass,
  "no-floating-promises": noFloatingPromises,
  "no-for-in-array": noForInArray,
  "no-generated-empty-object-type": noGeneratedEmptyObjectType,
  "no-implied-eval": noImpliedEval,
  "no-import-type-side-effects": noImportTypeSideEffects,
  "no-inferrable-types": noInferrableTypes,
  "no-invalid-this": noInvalidThis,
  "no-invalid-void-type": noInvalidVoidType,
  "no-magic-numbers": noMagicNumbers,
};
