// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-target-blank.js.
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  MISSING: "missing",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow usage of unsafe `target='_blank'`",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-target-blank"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `rel=\"noreferrer\"` attribute in a tag.",
    },
  },

  create(context) {
    /**
     * Checks whether a link is an external link or not.
     *
     * @param link A link to check
     */
    function isExternalLink(link: string): boolean {
      return /^(?:\w+:|\/\/)/.test(link);
    }
    return createVisitors(context, {
      Tag(node) {
        if (node.name !== "a") {
          return;
        }

        const target = findAttr(node, "target");
        if (target?.value?.value === "_blank") {
          const href = findAttr(node, "href");
          if (href?.value && isExternalLink(href.value.value)) {
            const rel = findAttr(node, "rel");
            if (rel?.value?.parts?.length) {
              return;
            }

            if (!rel?.value?.value.includes("noreferrer")) {
              context.report({
                node: target,
                messageId: MESSAGE_IDS.MISSING,
              });
            }
          }
        }
      },
    });
  },
};

export default rule;
