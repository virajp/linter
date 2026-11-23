// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-meta-charset.js.
import type {
  AnyNode,
  Tag,
} from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { find } from "../utils/array.js";
import {
  findAttr,
  isTag,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";

const MESSAGE_IDS = {
  MISSING: "missing",
  EMPTY: "empty",
};

function isMetaCharset(node: AnyNode): node is Tag {
  return isTag(node) && node.name === "meta" && !!findAttr(node, "charset");
}

/**
 * Get the indentation string for inserting a new child inside a head tag.
 */
function getChildIndent(headNode: Tag): string {
  const { children } = headNode;
  if (children.length > 0) {
    // If first child is a text node (e.g. "\n    "), extract trailing whitespace
    const first = children[0]!;
    if (first.type === "Text" && first.value) {
      const match = first.value.match(/\n([ \t]*)$/);
      if (match) {
        return match[1]!;
      }
    }
    // Non-text first child: use its column position
    return " ".repeat(first.loc.start.column);
  }
  // Empty head: use head's column + 2-space indent
  return " ".repeat(headNode.loc.start.column + 2);
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce use of `<meta charset=\"...\">` in `<head>`",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("require-meta-charset"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: "code",
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `<meta charset=\"...\">`.",
      [MESSAGE_IDS.EMPTY]: "Unexpected empty charset.",
    },
  },

  create(context) {
    return {
      Tag(node) {
        if (node.name !== "head") {
          return;
        }

        const metaCharset = find(node.children as AnyNode[], isMetaCharset);

        if (!metaCharset) {
          context.report({
            node,
            messageId: MESSAGE_IDS.MISSING,
            fix(fixer) {
              const indent = getChildIndent(node);
              return fixer.insertTextAfterRange(
                node.openEnd.range,
                `\n${indent}<meta charset="UTF-8">`,
              );
            },
          });
          return;
        }

        const charsetAttr = findAttr(metaCharset, "charset");

        if (charsetAttr) {
          if (!charsetAttr.value || !charsetAttr.value.value.length) {
            context.report({
              node: charsetAttr,
              messageId: MESSAGE_IDS.EMPTY,
              fix(fixer) {
                if (charsetAttr.value) {
                  // <meta charset=""> — replace empty value with UTF-8
                  return fixer.replaceTextRange(
                    charsetAttr.value.range,
                    "UTF-8",
                  );
                } else {
                  // <meta charset> — append ="UTF-8" after key
                  return fixer.insertTextAfterRange(
                    charsetAttr.key.range,
                    "=\"UTF-8\"",
                  );
                }
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
