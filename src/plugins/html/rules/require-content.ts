// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-content.js.
import type { Tag } from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findAttr,
  findParent,
  getNameOf,
  hasNonWhitespaceValue,
  isTag,
  isText,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  REQUIRE_CONTENT: "requireContent",
};

/**
 * Default set of elements that must have meaningful content. These are elements
 * where empty content is almost always a bug or an accessibility failure.
 */
const DEFAULT_ELEMENTS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "button",
  "li",
  "dt",
  "dd",
  "option",
  "label",
]);

/**
 * Returns true if the element has an accessible name via ARIA attributes,
 * making visible text content optional.
 */
function hasAriaAccessibleName(node: Tag): boolean {
  return !!(findAttr(node, "aria-label") || findAttr(node, "aria-labelledby"));
}

/**
 * Returns true if the element is hidden from the accessibility tree.
 */
function isHidden(node: Tag): boolean {
  if (findAttr(node, "hidden")) { return true; }
  const ariaHidden = findAttr(node, "aria-hidden");
  return ariaHidden?.value?.value === "true";
}

/**
 * Returns true if the element has meaningful content — at least one child that
 * is a non-whitespace text node or a non-hidden child element.
 */
function hasContent(node: Tag): boolean {
  for (const child of node.children) {
    if (isText(child) && child.value.trim().length > 0) { return true; }
    if (isTag(child) && !isHidden(child)) { return true; }
  }
  return false;
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require that certain elements have meaningful content.",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("require-content"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.REQUIRE_CONTENT]:
        "<{{name}}> must have meaningful content or an accessible name (aria-label / aria-labelledby).",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const tagName = node.name.toLowerCase();
        if (!DEFAULT_ELEMENTS.has(tagName)) { return; }

        if (isHidden(node)) { return; }

        if (hasAriaAccessibleName(node)) { return; }

        if (tagName === "option") {
          const datalist = findParent(node, (parent) => {
            return isTag(parent) && getNameOf(parent) === "datalist";
          });
          if (datalist) {
            const attrValue = findAttr(node, "value");
            if (hasNonWhitespaceValue(attrValue)) {
              return;
            }
          }
        }

        if (!hasContent(node)) {
          context.report({
            loc: {
              start: node.openStart.loc.start,
              end: node.openEnd.loc.end,
            },
            data: { name: node.name },
            messageId: MESSAGE_IDS.REQUIRE_CONTENT,
          });
        }
      },
    });
  },
};

export default rule;
