// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-frame-title.js.
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  MISSING: "missing",
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require `title` in `<frame>`, `<iframe>`",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("require-frame-title"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: false as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `title` attribute in {{frame}}.",
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected empty `title`.",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        if (node.name !== "frame" && node.name !== "iframe") {
          return;
        }
        const title = findAttr(node, "title");
        if (!title) {
          context.report({
            node: node.openStart,
            data: { frame: `<${node.name}>` },
            messageId: MESSAGE_IDS.MISSING,
          });
        } else if (!title.value || title.value.value.trim().length === 0) {
          context.report({
            node: title,
            messageId: MESSAGE_IDS.UNEXPECTED,
          });
        }
      },
    });
  },
};

export default rule;
