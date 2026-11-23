// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/isTypeOnlyReference.ts.
import type { ScopeVariable } from "@typescript-eslint/scope-manager";
import type { TSESLint } from "@typescript-eslint/utils";

import { DefinitionType } from "@typescript-eslint/scope-manager";

import { referenceContainsTypePredicate } from "./referenceContainsTypePredicate.js";
import { referenceContainsTypeQuery } from "./referenceContainsTypeQuery.js";

export function isMergedTypeValueVariable(variable: ScopeVariable): boolean {
  return (
    "isTypeVariable" in variable
    && "isValueVariable" in variable
    && variable.isTypeVariable
    && variable.isValueVariable
  );
}

export function isTypeOnlyReference(
  variable: ScopeVariable,
  ref: TSESLint.Scope.Reference,
): boolean {
  if (
    referenceContainsTypeQuery(ref.identifier)
    || referenceContainsTypePredicate(ref.identifier)
  ) {
    return true;
  }

  return (
    variable.defs.some((def) => def.type === DefinitionType.Variable)
    && ref.isValueReference === false
  );
}
