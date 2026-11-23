// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/css-no-empty-blocks.js.
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";

const MESSAGE_IDS = {
  EMPTY_BLOCK: "emptyBlock",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Disallows empty CSS blocks in `<style>` tags.",
      recommended: false,
      category: RULE_CATEGORY.BEST_PRACTICE,
    } as Rule.RuleMetaData["docs"],
    messages: {
      [MESSAGE_IDS.EMPTY_BLOCK]: "Unexpected empty block found.",
    },
  },
  // Upstream puts `fixable` and `schema` outside `meta`; kept as is.
  fixable: null,
  schema: [],
  create(context) {
    return {
      CssBlock(node) {
        if (node.children.length === 0) {
          context.report({
            loc: node.loc,
            messageId: MESSAGE_IDS.EMPTY_BLOCK,
          });
        }
      },
    };
  },
} as RuleModule<[]>;

export default rule;
