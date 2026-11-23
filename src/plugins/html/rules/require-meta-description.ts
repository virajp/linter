// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-meta-description.js.
import type {
  AnyNode,
  Tag,
} from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { filter } from "../utils/array.js";
import {
  findAttr,
  isTag,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";

const MESSAGE_IDS = {
  MISSING: "missing",
  EMPTY: "empty",
};

function isMetaTagNode(node: AnyNode): node is Tag {
  return isTag(node) && node.name === "meta";
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require use of `<meta name=\"description\">` in `<head>`",
      category: RULE_CATEGORY.SEO,
      recommended: false,
      url: getRuleUrl("require-meta-description"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `<meta name=\"description\">`.",
      [MESSAGE_IDS.EMPTY]: "Unexpected empty `content` in `<meta name=\"description\">`",
    },
  },
  create(context) {
    return {
      Tag(node) {
        if (node.name !== "head") {
          return;
        }
        const metaTags = filter(node.children as AnyNode[], isMetaTagNode);

        const descriptionMetaTags = metaTags.filter((meta) => {
          const nameAttr = findAttr(meta, "name");
          return nameAttr?.value?.value.toLowerCase() === "description";
        });

        if (descriptionMetaTags.length === 0) {
          context.report({
            node,
            messageId: MESSAGE_IDS.MISSING,
          });
        } else {
          descriptionMetaTags.forEach((meta) => {
            const content = findAttr(meta, "content");
            if (
              !content
              || !content.value
              || !content.value.value.trim().length
            ) {
              context.report({
                node: content || meta,
                messageId: MESSAGE_IDS.EMPTY,
              });
            }
          });
        }
      },
    };
  },
};

export default rule;
