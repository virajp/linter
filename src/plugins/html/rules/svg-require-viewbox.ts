// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/svg-require-viewbox.js.
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findAttr,
  hasTemplate,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  MISSING: "missing",
  EMPTY: "empty",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require `viewBox` attribute on `<svg>` elements",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("svg-require-viewbox"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `viewBox` attribute on `<svg>`.",
      [MESSAGE_IDS.EMPTY]: "Empty `viewBox` attribute on `<svg>`.",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        if (node.name !== "svg") {
          return;
        }

        const viewBoxAttr = findAttr(node, "viewBox");

        if (!viewBoxAttr) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.MISSING,
          });
          return;
        }

        const { value } = viewBoxAttr;
        if (value && hasTemplate(value)) {
          return;
        }

        if (!value || !value.value || value.value.trim() === "") {
          context.report({
            node: viewBoxAttr,
            messageId: MESSAGE_IDS.EMPTY,
          });
        }
      },
    });
  },
};

export default rule;
