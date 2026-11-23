// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-empty-headings.js.
import type {
  Tag,
  Text,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findAttr,
  getNameOf,
  isTag,
  isText,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  EMPTY_HEADING: "emptyHeading",
  INACCESSIBLE_HEADING: "inaccessibleHeading",
};

const HEADING_NAMES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function isAriaHidden(node: Tag) {
  const ariaHiddenAttr = findAttr(node, "aria-hidden");
  return ariaHiddenAttr?.value?.value === "true";
}

function isRoleHeading(node: Tag): boolean {
  const roleAttr = findAttr(node, "role");
  return roleAttr?.value?.value === "heading";
}

function getAltText(node: Tag): string {
  if (getNameOf(node) === "img") {
    const altAttr = findAttr(node, "alt");
    if (altAttr?.value?.value) {
      return altAttr.value.value;
    }
  }
  return "";
}

function getAllText(node: Text | Tag): string {
  if (!isTag(node)) { return ""; }

  let text = "";
  for (const child of node.children) {
    if (isText(child)) {
      text += child.value.trim();
    } else if (isTag(child)) {
      text += getAllText(child) || getAltText(child);
    }
  }
  return text;
}

function getAccessibleText(node: Text | Tag): string {
  if (!isTag(node) || !node.children.length) { return ""; }
  let text = "";
  for (const child of node.children) {
    if (isText(child)) {
      text += child.value.trim();
    } else if (isTag(child) && !isAriaHidden(child)) {
      text += getAccessibleText(child) || getAltText(child);
    }
  }
  return text;
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Disallow empty or inaccessible headings.",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-empty-headings"),
    } as Rule.RuleMetaData["docs"],
    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.EMPTY_HEADING]: "Headings must not be empty.",
      [MESSAGE_IDS.INACCESSIBLE_HEADING]: "Heading text is inaccessible to assistive technology.",
    },
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const tagName = getNameOf(node);
        const isHeadingTag = HEADING_NAMES.has(tagName);
        const isRoleHeadingEl = isRoleHeading(node);
        if (!isHeadingTag && !isRoleHeadingEl) { return; }

        // Gather all text (including aria-hidden)
        const allText = getAllText(node);
        if (!allText) {
          context.report({
            node,
            messageId: MESSAGE_IDS.EMPTY_HEADING,
          });
          return;
        }
        // Gather accessible text (not aria-hidden)
        const accessibleText = getAccessibleText(node);
        if (!accessibleText) {
          context.report({
            node,
            messageId: MESSAGE_IDS.INACCESSIBLE_HEADING,
          });
        }
      },
    });
  },
};

export default rule;
