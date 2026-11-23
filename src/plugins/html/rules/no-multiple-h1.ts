// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-multiple-h1.js.
import type { Tag } from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";

const MESSAGE_IDS = {
  MULTIPLE_H1: "unexpectedMultiH1",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow multiple `<h1></h1>`.",
      category: RULE_CATEGORY.SEO,
      recommended: true,
      url: getRuleUrl("no-multiple-h1"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MULTIPLE_H1]: "Unexpected multiple `<h1></h1>`.",
    },
  },

  create(context) {
    const h1s: Tag[] = [];

    return {
      "Tag"(node) {
        if (node.name === "h1") {
          h1s.push(node);
        }
      },
      "Document:exit"() {
        if (h1s.length > 1) {
          h1s.forEach((h1) => {
            context.report({
              node: h1,
              messageId: MESSAGE_IDS.MULTIPLE_H1,
            });
          });
        }
      },
    };
  },
};

export default rule;
