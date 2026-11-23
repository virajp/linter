// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/class-spacing.js.
import {
  CLASS_SPACING_MESSAGE_IDS,
  classSpacing,
} from "@html-eslint/core";
import type { Rule } from "eslint";
import { createAttributeValueAdapter } from "../adapters/factory.js";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const rule: RuleModule<[]> = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow extra spacing in class attribute values",
      recommended: false,
      category: RULE_CATEGORY.STYLE,
      url: getRuleUrl("class-spacing"),
    } as Rule.RuleMetaData["docs"],
    fixable: "code",
    schema: [],
    messages: {
      [CLASS_SPACING_MESSAGE_IDS.extraSpacing]: "Unexpected extra spacing in class attribute value",
    },
  },

  create(context) {
    const { checkClassValue } = classSpacing();
    return createVisitors(context, {
      Attribute(node) {
        if (node.key.value.toLowerCase() !== "class" || !node.value) {
          return;
        }

        const adapter = createAttributeValueAdapter(node.value);
        const result = checkClassValue(adapter);
        for (const { loc, messageId, range } of result) {
          context.report({
            loc,
            messageId,
            fix(fixer) {
              return fixer.removeRange(range);
            },
          });
        }
      },
    });
  },
};

export default rule;
