// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-lang.js.
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
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
      description: "Require `lang` attribute on `<html>` tag",
      category: RULE_CATEGORY.SEO,
      recommended: true,
      url: getRuleUrl("require-lang"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `lang` attribute in `<html>` tag.",
      [MESSAGE_IDS.EMPTY]: "Unexpected empty `lang` in in `<html>` tag.",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        if (node.name !== "html") {
          return;
        }
        const langAttr = findAttr(node, "lang");
        if (!langAttr) {
          context.report({
            loc: {
              start: node.openStart.loc.start,
              end: node.openEnd.loc.end,
            },
            messageId: MESSAGE_IDS.MISSING,
          });
        } else if (langAttr.value?.value.trim().length === 0) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.EMPTY,
          });
        }
      },
    });
  },
};

export default rule;
