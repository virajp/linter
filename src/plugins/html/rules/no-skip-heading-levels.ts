// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-skip-heading-levels.js.
import type { Tag } from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow skipping heading levels",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-skip-heading-levels"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected skipping heading level. <h{{expected}}> is expected",
    },
  },

  create(context) {
    const headings: { node: Tag; level: number }[] = [];

    return {
      "Tag"(node) {
        if (!["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.name)) {
          return;
        }
        headings.push({
          node,
          level: parseInt(node.name.replace("h", ""), 10),
        });
      },
      "Document:exit"() {
        if (headings.length <= 1) {
          return;
        }
        headings.sort((a, b) => a.node.range[0] - b.node.range[0]);
        headings.forEach((current, index) => {
          const next = headings[index + 1];
          if (next) {
            if (next.level - current.level > 1) {
              context.report({
                node: next.node,
                data: { expected: String(current.level + 1) },
                messageId: MESSAGE_IDS.UNEXPECTED,
              });
            }
          }
        });
      },
    };
  },
};

export default rule;
