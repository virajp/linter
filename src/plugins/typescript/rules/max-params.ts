// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/max-params.ts.
import type { TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from "../util/index.js";

import { getESLintCoreRule } from "../util/getESLintCoreRule.js";
import { createRule } from "../util/index.js";

type FunctionLike =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.TSDeclareFunction
  | TSESTree.TSFunctionType;

type FunctionRuleListener<T extends FunctionLike> = (node: T) => void;

const baseRule = getESLintCoreRule("max-params");

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: "max-params",
  meta: {
    type: "suggestion",
    // defaultOptions, -- base rule does not use defaultOptions
    docs: {
      description: "Enforce a maximum number of parameters in function definitions",
      extendsBaseRule: true,
    },
    messages: baseRule.meta.messages,
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          countVoidThis: {
            type: "boolean",
            description: "Whether to count a `this` declaration when the type is `void`.",
          },
          max: {
            type: "integer",
            description: "A maximum number of parameters in function definitions.",
            minimum: 0,
          },
          maximum: {
            type: "integer",
            description: "(deprecated) A maximum number of parameters in function definitions.",
            minimum: 0,
          },
        },
      },
    ],
  },

  defaultOptions: [{ countVoidThis: false, max: 3 }],

  // @ts-expect-error -- the options element is possibly undefined; defaultOptions sets it
  create(context, [{ countVoidThis }]) {
    const baseRules = baseRule.create(context);

    if (countVoidThis === true) {
      return baseRules;
    }

    const removeVoidThisParam = <T extends FunctionLike>(node: T): T => {
      if (
        node.params.length === 0
        || node.params[0]!.type !== AST_NODE_TYPES.Identifier
        || (node.params[0] as TSESTree.Identifier).name !== "this"
        || (node.params[0] as TSESTree.Identifier).typeAnnotation?.typeAnnotation.type
          !== AST_NODE_TYPES.TSVoidKeyword
      ) {
        return node;
      }

      return {
        ...node,
        params: node.params.slice(1),
      };
    };

    const wrapListener = <T extends FunctionLike>(
      listener: FunctionRuleListener<T>,
    ): FunctionRuleListener<T> => {
      return (node: T): void => {
        listener(removeVoidThisParam(node));
      };
    };

    return {
      ArrowFunctionExpression: wrapListener(baseRules.ArrowFunctionExpression),
      FunctionDeclaration: wrapListener(baseRules.FunctionDeclaration),
      FunctionExpression: wrapListener(baseRules.FunctionExpression),
      TSDeclareFunction: wrapListener(baseRules.FunctionDeclaration),
      TSFunctionType: wrapListener(baseRules.FunctionDeclaration),
    };
  },
});
