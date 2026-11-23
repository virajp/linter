// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-button-type.js.
import type { AttributeValue } from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type {
  RuleModule,
  SuggestionReportDescriptor,
} from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  MISSING: "missing",
  INVALID: "invalid",
  REPLACE_TO_SUBMIT: "replaceToSubmit",
  REPLACE_TO_BUTTON: "replaceToButton",
  REPLACE_TO_RESET: "replaceToReset",
};

const VALID_BUTTON_TYPES_SET = new Set(["submit", "button", "reset"]);

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require use of the button element with a valid type attribute.",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("require-button-type"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: true as unknown as "code",
    hasSuggestions: true,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing a type attribute for button",
      [MESSAGE_IDS.INVALID]: "\"{{type}}\" is an invalid value for button type attribute.",
      [MESSAGE_IDS.REPLACE_TO_BUTTON]: "Replace the type with 'button'",
      [MESSAGE_IDS.REPLACE_TO_SUBMIT]: "Replace the type with 'submit'",
      [MESSAGE_IDS.REPLACE_TO_RESET]: "Replace the type with 'reset'",
    },
  },

  create(context) {
    function getSuggestions(
      node: AttributeValue,
    ): SuggestionReportDescriptor[] {
      return [
        {
          messageId: MESSAGE_IDS.REPLACE_TO_SUBMIT,
          fix: (fixer) => fixer.replaceTextRange(node.range, "submit"),
        },
        {
          messageId: MESSAGE_IDS.REPLACE_TO_BUTTON,
          fix: (fixer) => fixer.replaceTextRange(node.range, "button"),
        },
        {
          messageId: MESSAGE_IDS.REPLACE_TO_RESET,
          fix: (fixer) => fixer.replaceTextRange(node.range, "reset"),
        },
      ];
    }

    return createVisitors(context, {
      Tag(node) {
        if (node.name !== "button") {
          return;
        }
        const typeAttr = findAttr(node, "type");
        if (!typeAttr?.value) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.MISSING,
            fix(fixer) {
              return fixer.insertTextAfter(node.openStart, " type=\"submit\"");
            },
          });
        } else if (
          !VALID_BUTTON_TYPES_SET.has(typeAttr.value.value)
          && !typeAttr.value.parts.length
        ) {
          context.report({
            node: typeAttr,
            messageId: MESSAGE_IDS.INVALID,
            data: {
              type: typeAttr.value.value,
            },
            suggest: getSuggestions(typeAttr.value),
          });
        }
      },
    });
  },
};

export default rule;
