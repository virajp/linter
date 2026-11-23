// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-heading-inside-button.js.
import type { Tag } from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findParent,
  getNameOf,
  isTag,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const HEADING_NAMES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallows the use of heading elements inside <button>.",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-heading-inside-button"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected heading inside button",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        if (!HEADING_NAMES.has(getNameOf(node))) {
          return;
        }
        const button = findParent(
          node,
          (parent) => isTag(parent) && getNameOf(parent as Tag) === "button",
        );

        if (button) {
          context.report({
            node,
            messageId: MESSAGE_IDS.UNEXPECTED,
          });
        }
      },
    });
  },
};

export default rule;
