// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-positive-tabindex.js.
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
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
      description: "Disallow use of positive `tabindex`.",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-positive-tabindex"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected use of positive `tabindex`.",
    },
  },

  create(context) {
    function check(node: Tag | StyleTag | ScriptTag) {
      const tabIndexAttr = findAttr(node, "tabindex");
      if (
        tabIndexAttr?.value
        && !tabIndexAttr.value.parts.length
        && parseInt(tabIndexAttr.value.value, 10) > 0
      ) {
        context.report({
          node: tabIndexAttr,
          messageId: MESSAGE_IDS.UNEXPECTED,
        });
      }
    }

    return createVisitors(context, {
      Tag: check,
      StyleTag: check,
      ScriptTag: check,
    });
  },
};

export default rule;
