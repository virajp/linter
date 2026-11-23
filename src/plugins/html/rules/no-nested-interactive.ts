// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-nested-interactive.js.
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

/**
 * @see https://html.spec.whatwg.org/multipage/dom.html#interactive-content-2
 */
function isInteractive(tag: Tag): boolean {
  const tagName = getNameOf(tag);

  switch (tagName) {
    // a (if the href attribute is present)
    case "a": {
      return !!findAttr(tag, "href");
    }
    // audio (if the controls attribute is present)
    // video (if the controls attribute is present)
    case "audio":
    case "video": {
      return !!findAttr(tag, "controls");
    }
    // img (if the usemap attribute is present)
    case "img": {
      return !!findAttr(tag, "usemap");
    }
    // input (if the type attribute is not in the Hidden state)
    case "input": {
      const typeAttr = findAttr(tag, "type");
      return typeAttr?.value?.value !== "hidden";
    }
    // case "details": see https://github.com/yeonjuan/html-eslint/issues/518
    case "summary":
    case "button":
    case "embed":
    case "iframe":
    case "label":
    case "select":
    case "textarea": {
      return true;
    }
    default: {
      return false;
    }
  }
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallows nested interactive elements",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-nested-interactive"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected interactive elements nested (parent interactive: <{{tag}}>)",
    },
  },

  create(context) {
    let interactiveStack: Tag[] = [];

    return createVisitors(context, {
      "Document"() {
        interactiveStack = [];
      },
      "Tag"(node) {
        if (!isInteractive(node)) {
          return;
        }
        if (interactiveStack.length) {
          if (interactiveStack.length === 1) {
            const parentLabel = interactiveStack.find(
              (tag) => getNameOf(tag) === "label",
            );
            if (parentLabel && getNameOf(node) !== "label") {
              return;
            }
          }

          context.report({
            node,
            messageId: MESSAGE_IDS.UNEXPECTED,
            data: {
              tag: interactiveStack[interactiveStack.length - 1]!.name,
            },
          });
        }

        interactiveStack.push(node);
      },
      "Tag:exit"(node) {
        if (interactiveStack[interactiveStack.length - 1] === node) {
          interactiveStack.pop();
        }
      },
    });
  },
};

export default rule;
