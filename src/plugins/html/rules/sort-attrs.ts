// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/sort-attrs.js.
import type { Attribute } from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type {
  RuleFixer,
  RuleModule,
} from "../types/index.js";
import { hasTemplate } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { getSourceCode } from "../utils/source-code.js";
import { createVisitors } from "../utils/visitors.js";

type Option = {
  priority?: (
    | string
    | { pattern: string; order?: "preserve" | "alphabetically" }
  )[];
};

const MESSAGE_IDS = {
  UNSORTED: "unsorted",
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce priority and alphabetical sorting of attributes",
      category: RULE_CATEGORY.STYLE,
      recommended: false,
      url: getRuleUrl("sort-attrs"),
    } as RuleModule<[Option]>["meta"]["docs"],
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          priority: {
            type: "array",
            items: {
              oneOf: [
                {
                  type: "string",
                },
                {
                  type: "object",
                  properties: {
                    pattern: {
                      type: "string",
                    },
                    order: {
                      type: "string",
                      enum: ["preserve", "alphabetically"],
                    },
                  },
                  required: ["pattern"],
                  additionalProperties: false,
                },
              ],
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.UNSORTED]: "Attributes should be sorted by priority and alphabetically",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const option = context.options[0] || {
      priority: ["id", "type", "class", "style"],
    };
    const priority: (
      | string
      | {
        pattern: string;
        order?: "preserve" | "alphabetically";
        regex: RegExp;
      }
    )[] = (option.priority || []).map((item) => {
      if (item && typeof item === "object" && "pattern" in item) {
        return {
          ...item,
          regex: new RegExp(item.pattern, "u"),
        };
      }
      return item;
    });

    function matchesPriority(
      attrName: string,
      priorityItem: string | { pattern: string; regex: RegExp },
    ): boolean {
      if (typeof priorityItem === "string") {
        return attrName === priorityItem;
      }
      if (
        priorityItem
        && typeof priorityItem === "object"
        && priorityItem.regex
      ) {
        return priorityItem.regex.test(attrName);
      }
      return false;
    }

    function getPriorityIndex(attrName: string): number {
      for (let i = 0; i < priority.length; i++) {
        if (matchesPriority(attrName, priority[i]!)) {
          return i;
        }
      }
      return -1;
    }

    function compare(attrA: Attribute, attrB: Attribute): number {
      const keyA = attrA.key.value;
      const keyB = attrB.key.value;

      const keyAReservedValue = getPriorityIndex(keyA);
      const keyBReservedValue = getPriorityIndex(keyB);
      if (keyAReservedValue >= 0 && keyBReservedValue >= 0) {
        if (keyAReservedValue !== keyBReservedValue) {
          return keyAReservedValue - keyBReservedValue;
        }
        const priorityItem = priority[keyAReservedValue];
        if (
          typeof priorityItem === "object"
          && priorityItem.order === "alphabetically"
        ) {
          return keyA.localeCompare(keyB);
        }
        return 0;
      } else if (keyAReservedValue >= 0) {
        return -1;
      } else if (keyBReservedValue >= 0) {
        return 1;
      }
      return keyA.localeCompare(keyB);
    }

    function getSortedCode(
      source: string,
      unsorted: Attribute[],
      sorted: Attribute[],
    ): string {
      let result = "";
      unsorted.forEach((unsortedAttr, index) => {
        const sortedAttr = sorted[index]!;
        result += source.slice(sortedAttr.range[0], sortedAttr.range[1]);

        const nextUnsortedAttr = unsorted[index + 1];
        if (nextUnsortedAttr) {
          result += source.slice(
            unsortedAttr.range[1],
            nextUnsortedAttr.range[0],
          );
        }
      });
      return result;
    }

    function fix(fixer: RuleFixer, unsorted: Attribute[], sorted: Attribute[]) {
      const source = sourceCode.getText();
      return fixer.replaceTextRange(
        [unsorted[0]!.range[0], unsorted[unsorted.length - 1]!.range[1]],
        getSortedCode(source, unsorted, sorted),
      );
    }

    function isChanged(before: Attribute[], after: Attribute[]): boolean {
      for (let i = 0; i < before.length; i++) {
        if (before[i] !== after[i]) { return true; }
      }
      return false;
    }

    function groupAttributes(attributes: Attribute[]): Attribute[][] {
      const attributesList: Attribute[][] = [];
      let index = 0;

      for (const attribute of attributes) {
        if (hasTemplate(attribute.key)) {
          index = attributesList.length;
          continue;
        }
        if (!attributesList[index]) {
          attributesList[index] = [];
        }
        attributesList[index]!.push(attribute);
      }
      return attributesList;
    }

    function checkSorting(unsorted: Attribute[]) {
      if (unsorted.length <= 1) {
        return;
      }
      const grouped = groupAttributes(unsorted);
      grouped.forEach((unsorted) => {
        const sorted = [...unsorted].sort(compare);

        if (!isChanged(unsorted, sorted)) {
          return;
        }
        const first = unsorted[0]!;
        const last = unsorted[unsorted.length - 1]!;
        context.report({
          loc: {
            start: first.loc.start,
            end: last.loc.end,
          },
          messageId: MESSAGE_IDS.UNSORTED,
          fix(fixer) {
            return fix(fixer, unsorted, sorted);
          },
        });
      });
    }

    return createVisitors(context, {
      ScriptTag(node) {
        checkSorting(node.attributes);
      },
      Tag(node) {
        checkSorting(node.attributes);
      },
      StyleTag(node) {
        checkSorting(node.attributes);
      },
    });
  },
};

export default rule;
