// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-title.js.
import type {
  AnyNode,
  Tag,
  Text,
} from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { find } from "../utils/array.js";
import {
  isTag,
  isText,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";

const MESSAGE_IDS = {
  MISSING_TITLE: "missing",
  EMPTY_TITLE: "empty",
};

function isTitle(node: AnyNode): node is Tag {
  return isTag(node) && node.name === "title";
}

function isNonEmptyText(node: AnyNode): node is Text {
  return isText(node) && node.value.trim().length > 0;
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require `<title>` in the `<head>`",
      category: RULE_CATEGORY.SEO,
      recommended: true,
      url: getRuleUrl("require-title"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING_TITLE]: "Missing `<title><title/>` in the `<head><head/>`",
      [MESSAGE_IDS.EMPTY_TITLE]: "Unexpected empty text in `<title><title/>`",
    },
  },
  create(context) {
    return {
      Tag(node) {
        if (node.name !== "head") {
          return;
        }

        const title = find(node.children as AnyNode[], isTitle);

        if (!title) {
          context.report({
            node,
            messageId: MESSAGE_IDS.MISSING_TITLE,
          });
          return;
        }

        const content = find(title.children as AnyNode[], isNonEmptyText);

        if (!content) {
          context.report({
            node: title,
            messageId: MESSAGE_IDS.EMPTY_TITLE,
          });
        }
      },
    };
  },
};

export default rule;
