// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-input-label.js.
import type {
  AnyNode,
  Document,
  Tag,
} from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findParent,
  getNameOf,
  hasNonWhitespaceValue,
  isTag,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  MISSING: "missingLabel",
};

const INPUT_TAGS = new Set(["input", "textarea", "select"]);

const LABEL_ATTRIBUTES = new Set(["aria-labelledby", "aria-label"]);

const SELF_LABELING_INPUT_TYPES = new Set(["button", "reset", "submit"]);

function collectLabelForTargets(root: Document) {
  const targets = new Set<string>();

  function walk(node: AnyNode) {
    if (!node || typeof node !== "object") {
      return;
    }
    if (isTag(node) && getNameOf(node) === "label") {
      for (const attr of node.attributes) {
        if (
          attr.key.value.toLowerCase() === "for"
          && attr.value?.value?.trim()
        ) {
          targets.add(attr.value.value);
        }
      }
    }

    if (!("children" in node)) {
      return;
    }
    const { children } = node;

    for (const child of children) {
      walk(child as AnyNode);
    }
  }

  walk(root);
  return targets;
}

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforces use of label for form elements(`input`, `textarea`, `select`)",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("require-input-label"),
    } as RuleModule<[]>["meta"]["docs"],
    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing an associated label",
    },
  },
  create(context) {
    const stack: Set<string>[] = [];
    return createVisitors(context, {
      "Document"(node) {
        stack.push(collectLabelForTargets(node));
      },
      "Document:exit"() {
        stack.pop();
      },
      "Tag"(node) {
        const labelForTargets = stack[stack.length - 1] ?? new Set();
        const tagName = getNameOf(node);
        if (!INPUT_TAGS.has(tagName)) {
          return;
        }

        let idValue: string | undefined;
        let typeValue: string | undefined;
        let valueAttr: Tag["attributes"][number] | undefined;
        let altAttr: Tag["attributes"][number] | undefined;
        let titleAttr: Tag["attributes"][number] | undefined;

        for (const attr of node.attributes) {
          const key = attr.key.value.toLowerCase();

          if (LABEL_ATTRIBUTES.has(key) && hasNonWhitespaceValue(attr)) {
            return;
          }

          switch (key) {
            case "id":
              idValue = attr.value?.value;
              break;
            case "type":
              typeValue = attr.value?.value?.toLowerCase();
              break;
            case "value":
              valueAttr = attr;
              break;
            case "alt":
              altAttr = attr;
              break;
            case "title":
              titleAttr = attr;
              break;
          }
        }

        if (tagName === "input") {
          if (typeValue === "hidden") {
            return;
          }

          if (
            SELF_LABELING_INPUT_TYPES.has(typeValue ?? "")
            && hasNonWhitespaceValue(valueAttr)
          ) {
            return;
          }

          if (
            typeValue === "image"
            && (hasNonWhitespaceValue(altAttr)
              || hasNonWhitespaceValue(titleAttr)
              || hasNonWhitespaceValue(valueAttr))
          ) {
            return;
          }
        }

        const label = findParent(node, (parent) => {
          return isTag(parent) && getNameOf(parent) === "label";
        });

        if (label) {
          return;
        }

        if (idValue && labelForTargets.has(idValue)) {
          return;
        }

        context.report({
          node,
          messageId: "missingLabel",
        });
      },
    });
  },
};

export default rule;
