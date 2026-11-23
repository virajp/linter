// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-form-method.js.
import { NODE_TYPES } from "@html-eslint/parser";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findAttr,
  getNameOf,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  MISSING: "missing",
  MISSING_VALUE: "missingValue",
  UNEXPECTED: "unexpected",
};

const ALLOWED_METHODS = new Set(["GET", "POST", "DIALOG"]);

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require `method` attribute in `<form>`",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("require-form-method"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: false as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "The 'method' attribute is missing on the <form>.",
      [MESSAGE_IDS.MISSING_VALUE]: "The 'method' attribute value is missing on the <form>",
      [MESSAGE_IDS.UNEXPECTED]: "The 'method' attribute has an invalid value on the <form>.",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        if (getNameOf(node) !== "form") {
          return;
        }
        const method = findAttr(node, "method");

        if (!method) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.MISSING,
          });
          return;
        }

        if (!method.value) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.MISSING_VALUE,
          });
          return;
        }

        if (method.value.parts?.some((part) => part.type !== NODE_TYPES.Part)) {
          return;
        }

        if (!ALLOWED_METHODS.has(method.value.value.toUpperCase())) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.UNEXPECTED,
          });
        }
      },
    });
  },
};

export default rule;
