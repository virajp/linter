// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-aria-hidden-body.js.
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow use of aria-hidden attributes on the `body` element.",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-aria-hidden-body"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected aria-hidden on body tag.",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        if (node.name !== "body") {
          return;
        }
        const ariaHiddenAttr = findAttr(node, "aria-hidden");
        if (!ariaHiddenAttr) {
          return;
        }
        if (ariaHiddenAttr.value?.parts.length) {
          return;
        }

        if (ariaHiddenAttr.value?.value !== "false" || !ariaHiddenAttr.value) {
          context.report({
            node: ariaHiddenAttr,
            messageId: MESSAGE_IDS.UNEXPECTED,
          });
        }
      },
    });
  },
};

export default rule;
