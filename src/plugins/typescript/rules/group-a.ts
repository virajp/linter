// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/index.ts (rule registry, group A).
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import type { ESLintPluginDocs } from "../rules-types.js";
import adjacentOverloadSignatures from "./adjacent-overload-signatures.js";
import arrayType from "./array-type.js";
import awaitThenable from "./await-thenable.js";
import banTsComment from "./ban-ts-comment.js";
import banTslintComment from "./ban-tslint-comment.js";
import classLiteralPropertyStyle from "./class-literal-property-style.js";
import classMethodsUseThis from "./class-methods-use-this.js";
import consistentGenericConstructors from "./consistent-generic-constructors.js";
import consistentIndexedObjectStyle from "./consistent-indexed-object-style.js";
import consistentReturn from "./consistent-return.js";
import consistentTypeAssertions from "./consistent-type-assertions.js";
import consistentTypeDefinitions from "./consistent-type-definitions.js";
import consistentTypeExports from "./consistent-type-exports.js";
import consistentTypeImports from "./consistent-type-imports.js";
import defaultParamLast from "./default-param-last.js";
import dotNotation from "./dot-notation.js";

export const groupARules: Record<
  string,
  RuleModule<string, readonly unknown[], ESLintPluginDocs>
> = {
  "adjacent-overload-signatures": adjacentOverloadSignatures,
  "array-type": arrayType,
  "await-thenable": awaitThenable,
  "ban-ts-comment": banTsComment,
  "ban-tslint-comment": banTslintComment,
  "class-literal-property-style": classLiteralPropertyStyle,
  "class-methods-use-this": classMethodsUseThis,
  "consistent-generic-constructors": consistentGenericConstructors,
  "consistent-indexed-object-style": consistentIndexedObjectStyle,
  "consistent-return": consistentReturn,
  "consistent-type-assertions": consistentTypeAssertions,
  "consistent-type-definitions": consistentTypeDefinitions,
  "consistent-type-exports": consistentTypeExports,
  "consistent-type-imports": consistentTypeImports,
  "default-param-last": defaultParamLast,
  "dot-notation": dotNotation,
};
