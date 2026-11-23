// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-non-scalable-viewport.js.
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow use of `user-scalable=no` in `<meta name=\"viewport\">`.",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-non-scalable-viewport"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected use of `user-scalable=no`.",
    },
  },

  create(context) {
    return {
      Tag(node) {
        if (node.name !== "meta") {
          return;
        }
        const nameAttr = findAttr(node, "name");
        const contentAttr = findAttr(node, "content");
        if (
          nameAttr?.value?.value.toLowerCase() === "viewport"
          && contentAttr?.value?.value.match(/user-scalable\s*=\s*no/i)
        ) {
          context.report({
            node: contentAttr,
            messageId: MESSAGE_IDS.UNEXPECTED,
          });
        }
      },
    };
  },
};

export default rule;
