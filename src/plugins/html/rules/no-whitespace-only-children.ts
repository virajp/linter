// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-whitespace-only-children.js.
import type { Tag } from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  getLocBetween,
  getNameOf,
  isComment,
  isText,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  WHITESPACE_ONLY_CHILDREN: "whitespaceOnlyChildren",
};

function hasOnlyWhitespaceChildren(node: Tag) {
  if (!node.children || node.children.length === 0) {
    return false;
  }

  if (node.children.every((child) => isComment(child))) {
    return false;
  }

  for (const child of node.children) {
    if (isComment(child)) {
      continue;
    }
    if (isText(child)) {
      if (child.value?.trim().length > 0) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}

const rule: RuleModule<[{ tagPatterns?: string[] }]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Disallow tags with only whitespace children.",
      recommended: false,
      category: RULE_CATEGORY.BEST_PRACTICE,
      url: getRuleUrl("no-whitespace-only-children"),
    } as RuleModule<[]>["meta"]["docs"],
    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          tagPatterns: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.WHITESPACE_ONLY_CHILDREN]: "Tag should not have only whitespace children.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const tagPatterns = (options.tagPatterns || []).map(
      (pattern) => new RegExp(pattern, "u"),
    );

    return createVisitors(context, {
      Tag(node) {
        if (!node.close) {
          return;
        }
        if (tagPatterns.length <= 0) {
          return;
        }

        const tagName = getNameOf(node);

        // If tagPatterns is specified, check if tag name matches any pattern
        const matches = tagPatterns.some((pattern) => pattern.test(tagName));
        if (!matches) {
          return;
        }

        if (hasOnlyWhitespaceChildren(node)) {
          const loc = getLocBetween(node.openEnd, node.close);
          context.report({
            loc,
            messageId: MESSAGE_IDS.WHITESPACE_ONLY_CHILDREN,
            fix(fixer) {
              return node
                .children
                .filter((child) => isText(child))
                .map((child) => fixer.removeRange(child.range));
            },
          });
        }
      },
    });
  },
};

export default rule;
