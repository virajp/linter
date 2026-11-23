// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-meta-viewport.js.
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

function isMetaViewport(node: AnyNode): node is Tag {
  if (isTag(node) && node.name === "meta") {
    const nameAttribute = findAttr(node, "name");
    return !!(
      nameAttribute
      && nameAttribute.value
      && nameAttribute.value.value.toLowerCase() === "viewport"
    );
  }
  return false;
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce use of `<meta name=\"viewport\">` in `<head>`",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("require-meta-viewport"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `<meta name=\"viewport\">`.",
      [MESSAGE_IDS.EMPTY]: "Unexpected empty `content` attribute in `<meta name=\"viewport\">`.",
    },
  },

  create(context) {
    return {
      Tag(node) {
        if (node.name !== "head") {
          return;
        }

        const metaViewport = find(node.children as AnyNode[], isMetaViewport);

        if (!metaViewport) {
          context.report({
            node,
            messageId: MESSAGE_IDS.MISSING,
          });
          return;
        }

        const contentAttribute = findAttr(metaViewport, "content");
        const isAttributeEmpty = !contentAttribute
          || !contentAttribute.value
          || !contentAttribute.value.value.length;

        if (isAttributeEmpty) {
          const reportTarget = !contentAttribute || !contentAttribute.value
            ? metaViewport
            : contentAttribute;
          context.report({
            node: reportTarget,
            messageId: MESSAGE_IDS.EMPTY,
          });
        }
      },
    };
  },
};

export default rule;
