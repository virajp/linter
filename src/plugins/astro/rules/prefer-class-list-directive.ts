// Ported from eslint-plugin-astro v3.2.1 (MIT), src/rules/prefer-class-list-directive.ts.
import type { AST } from "astro-eslint-parser";
import type { RuleModule } from "../types.js";
import { getAttributeName } from "../utils/ast-utils.js";
import { createRule } from "../utils/index.js";

export default createRule("prefer-class-list-directive", {
  meta: {
    docs: {
      description: "require `class:list` directives instead of `class` with expressions",
      category: "Stylistic Issues",
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected: "Unexpected `class` using expression. Use 'class:list' instead.",
    },
    fixable: "code",
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isAstro) {
      return {};
    }

    /** Verify */
    function verifyAttr(
      attr:
        | AST.JSXAttribute
        | AST.AstroTemplateLiteralAttribute
        | AST.AstroShorthandAttribute,
    ) {
      if (getAttributeName(attr) !== "class") {
        return;
      }
      if (
        !attr.value
        || attr.value.type !== "JSXExpressionContainer"
        || attr.value.expression.type === "JSXEmptyExpression"
      ) {
        return;
      }
      context.report({
        node: attr.name,
        messageId: "unexpected",
        fix(fixer) {
          if (attr.type === "AstroShorthandAttribute") {
            return fixer.insertTextBefore(attr, "class:list=");
          }
          return fixer.insertTextAfter(attr.name, ":list");
        },
      });
    }

    return {
      JSXAttribute: verifyAttr,
      AstroTemplateLiteralAttribute: verifyAttr,
    };
  },
}) as RuleModule;
