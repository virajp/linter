// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-aria-hidden-on-focusable.js.
import type { Tag } from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findAttr,
  getNameOf,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

// List of elements that are inherently focusable
const FOCUSABLE_ELEMENTS = new Set([
  "a", // if href is present
  "button",
  "input",
  "select",
  "textarea",
  "video", // if controls is present
  "audio", // if controls is present
  "details",
  "embed",
  "iframe",
  "summary",
]);

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow aria-hidden=\"true\" on focusable elements",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-aria-hidden-on-focusable"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected aria-hidden=\"true\" on focusable element.",
    },
  },

  create(context) {
    /**
     * Checks if an element is focusable
     */
    function isFocusable(node: Tag): boolean {
      const tagName = getNameOf(node);

      const contentEditableAttr = findAttr(node, "contenteditable");
      if (contentEditableAttr) {
        const value = contentEditableAttr.value?.value.toLowerCase() ?? "";

        if (value === "" || value === "true" || value === "plaintext-only") {
          return true;
        }
      }

      // Check for tabindex attribute
      const tabIndexAttr = findAttr(node, "tabindex");
      if (tabIndexAttr?.value) {
        const tabIndexValue = tabIndexAttr.value.value;
        // If tabindex is -1, the element is not focusable
        if (tabIndexValue === "-1") {
          return false;
        }
        // If tabindex is present and not -1, the element is focusable
        return true;
      }

      // Special cases for elements that are only focusable with certain attributes
      if (tagName === "a") {
        return !!findAttr(node, "href");
      }

      if (tagName === "audio" || tagName === "video") {
        return !!findAttr(node, "controls");
      }

      // Check if element is inherently focusable
      return FOCUSABLE_ELEMENTS.has(tagName);
    }

    return createVisitors(context, {
      Tag(node) {
        const ariaHiddenAttr = findAttr(node, "aria-hidden");
        if (!ariaHiddenAttr?.value) {
          return;
        }

        // Only check for aria-hidden="true"
        if (ariaHiddenAttr.value.value !== "true") {
          return;
        }

        // Check if the element is focusable
        if (isFocusable(node)) {
          context.report({
            node: ariaHiddenAttr,
            messageId: MESSAGE_IDS.UNEXPECTED,
          });
        }
      },
    });
  },
};

export default rule;
