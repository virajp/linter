// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/no-wrapper-object-types.ts.
import type {
  TSESLint,
  TSESTree,
} from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import {
  createRule,
  isReferenceToGlobalFunction,
} from "../util/index.js";

const classNames = new Set([
  "BigInt",
  "Boolean",
  "Number",
  "Object",
  "String",
  "Symbol",
]);

export default createRule({
  name: "no-wrapper-object-types",
  meta: {
    type: "problem",
    docs: {
      description: "Disallow using confusing built-in primitive class wrappers",
      recommended: "recommended",
    },
    fixable: "code",
    messages: {
      bannedClassType:
        "Prefer using the primitive `{{preferred}}` as a type name, rather than the upper-cased `{{typeName}}`.",
    },
    schema: [],
  },

  defaultOptions: [],
  create(context) {
    function checkBannedTypes(
      node: TSESTree.EntityName | TSESTree.Expression,
      includeFix: boolean,
    ): void {
      const typeName = node.type === AST_NODE_TYPES.Identifier && node.name;
      if (
        !typeName
        || !classNames.has(typeName)
        || !isReferenceToGlobalFunction(typeName, node, context.sourceCode)
      ) {
        return;
      }

      const preferred = typeName.toLowerCase();

      context.report({
        node,
        messageId: "bannedClassType",
        data: { preferred, typeName },
        fix: includeFix
          ? (fixer): TSESLint.RuleFix => fixer.replaceText(node, preferred)
          : undefined,
      });
    }

    return {
      TSClassImplements(node): void {
        checkBannedTypes(node.expression, false);
      },
      TSInterfaceHeritage(node): void {
        checkBannedTypes(node.expression, false);
      },
      TSTypeReference(node): void {
        checkBannedTypes(node.typeName, true);
      },
    };
  },
});
