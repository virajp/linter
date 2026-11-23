// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-duplicate-class.js.
import {
  NO_DUPLICATE_CLASS_MESSAGE_IDS,
  noDuplicateClass,
} from "@html-eslint/core";
import type { Rule } from "eslint";
import { createAttributeValueAdapter } from "../adapters/factory.js";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Disallow duplicate class names",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-duplicate-class"),
    } as Rule.RuleMetaData["docs"],
    fixable: "code",
    schema: [],
    messages: {
      [NO_DUPLICATE_CLASS_MESSAGE_IDS.duplicateClass]: "The class '{{className}}' is duplicated.",
    },
  },

  create(context) {
    const { checkClassValue } = noDuplicateClass();

    return createVisitors(context, {
      Attribute(node) {
        if (node.key.value.toLowerCase() !== "class" || !node.value) {
          return;
        }

        const adapter = createAttributeValueAdapter(node.value);
        const result = checkClassValue(adapter);

        for (const { loc, messageId, range, data } of result) {
          context.report({
            loc,
            messageId,
            data,
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
