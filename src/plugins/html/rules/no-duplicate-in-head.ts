// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-duplicate-in-head.js.
import type { TemplateHTMLVisitor } from "@html-eslint/template-parser";
import type { Tag } from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  areInMutuallyExclusiveBranches,
  getBranchSegments,
} from "../utils/branch-segments.js";
import {
  findAttr,
  getNameOf,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import {
  shouldCheckTaggedTemplateExpression,
  shouldCheckTemplateLiteral,
} from "../utils/settings.js";
import { getSourceCode } from "../utils/source-code.js";
import { parseTemplateLiteral } from "../utils/template-literal.js";

const MESSAGE_IDS = {
  DUPLICATE_TAG: "duplicateTag",
};

/**
 * Returns a formatted string representing a tag's key detail. E.g.,
 * meta[charset=UTF-8], meta[name=viewport], link[rel=canonical]
 */
function getTrackingKey(node: Tag): string | null {
  const tagName = getNameOf(node);

  if (["title", "base"].includes(tagName)) {
    return tagName;
  }

  if (tagName === "meta") {
    const charsetAttr = findAttr(node, "charset");
    if (charsetAttr) {
      return "meta[charset]";
    }

    const nameAttr = findAttr(node, "name");
    if (nameAttr?.value?.value === "viewport") {
      return "meta[name=viewport]";
    }
  }

  if (tagName === "link") {
    const relAttr = findAttr(node, "rel");
    const hrefAttr = findAttr(node, "href");
    if (relAttr?.value?.value === "canonical" && hrefAttr) {
      return "link[rel=canonical]";
    }
  }

  return null;
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Disallow duplicate tags in `<head>`",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-duplicate-in-head"),
    } as Rule.RuleMetaData["docs"],
    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.DUPLICATE_TAG]: "Duplicate <{{tag}}> tag in <head>.",
    },
  },

  create(context) {
    const branchSegments = getBranchSegments(context);

    const htmlTagsMap: Map<string, Tag[]> = new Map();
    let headCount = 0;

    function createTagVisitor(
      map: Map<string, Tag[]>,
      headCountRef: { count: number } | null = null,
    ) {
      return {
        "Tag"(node: Tag) {
          const tagName = getNameOf(node);

          if (tagName === "head") {
            if (headCountRef !== null) {
              headCountRef.count++;
            } else {
              headCount++;
            }
            return;
          }

          const currentHeadCount = headCountRef?.count ?? headCount;
          if (currentHeadCount === 0) { return; }

          const trackingKey = getTrackingKey(node);
          if (typeof trackingKey !== "string") { return; }

          if (!map.has(trackingKey)) {
            map.set(trackingKey, []);
          }

          const nodes = map.get(trackingKey);
          if (nodes) {
            nodes.push(node);
          }
        },

        "Tag:exit"(node: Tag) {
          const tagName = getNameOf(node);
          if (tagName === "head") {
            if (headCountRef !== null) {
              headCountRef.count--;
            } else {
              headCount--;
            }
          }
        },
      };
    }

    function report(
      map: Map<string, Tag[]>,
      segments: typeof branchSegments,
    ) {
      map.forEach((tags, tagKey) => {
        if (Array.isArray(tags) && tags.length > 1) {
          if (areInMutuallyExclusiveBranches(tags, segments)) {
            return;
          }
          tags.slice(1).forEach((tag) => {
            context.report({
              node: tag,
              data: { tag: tagKey },
              messageId: MESSAGE_IDS.DUPLICATE_TAG,
            });
          });
        }
      });
    }

    const htmlVisitor = createTagVisitor(htmlTagsMap);

    return {
      "Tag": htmlVisitor.Tag,
      "Tag:exit": htmlVisitor["Tag:exit"],

      "Document:exit"() {
        report(htmlTagsMap, branchSegments);
      },

      "TaggedTemplateExpression"(node) {
        const tagsMap: Map<string, Tag[]> = new Map();
        const headCountRef = { count: 0 };

        if (shouldCheckTaggedTemplateExpression(node, context)) {
          const visitor = createTagVisitor(tagsMap, headCountRef);
          parseTemplateLiteral(
            node.quasi,
            getSourceCode(context),
            visitor as unknown as TemplateHTMLVisitor,
          );
          report(tagsMap, branchSegments);
        }
      },

      "TemplateLiteral"(node) {
        const tagsMap: Map<string, Tag[]> = new Map();
        const headCountRef = { count: 0 };

        if (shouldCheckTemplateLiteral(node, context)) {
          const visitor = createTagVisitor(tagsMap, headCountRef);
          parseTemplateLiteral(
            node,
            getSourceCode(context),
            visitor as unknown as TemplateHTMLVisitor,
          );
          report(tagsMap, branchSegments);
        }
      },
    };
  },
};

export default rule;
