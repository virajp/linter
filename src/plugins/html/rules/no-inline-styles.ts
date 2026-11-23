// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-inline-styles.js.
import { NODE_TYPES } from "@html-eslint/parser";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  INLINE_STYLE: "unexpectedInlineStyle",
};

const rule: RuleModule<[{ allowExpressions: boolean }]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow using inline style",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-inline-styles"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [
      {
        type: "object",
        properties: {
          allowExpressions: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.INLINE_STYLE]: "Unexpected usage of inline style",
    },
  },

  create(context) {
    const { allowExpressions = false } = context.options[0] || {};

    return createVisitors(context, {
      Tag(node) {
        const styleAttr = findAttr(node, "style");
        if (!styleAttr) { return; }

        if (
          allowExpressions
          && styleAttr.value?.parts.some(
            (part) => part.type === NODE_TYPES.Template,
          )
        ) {
          return;
        }

        context.report({
          node: styleAttr,
          messageId: MESSAGE_IDS.INLINE_STYLE,
        });
      },
    });
  },
};

export default rule;
