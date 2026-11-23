// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-explicit-size.js.
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  findAttr,
  getNameOf,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

type Option = {
  allowClass?: string[];
  allowId?: string[];
};

const MESSAGE_IDS = {
  MISSING_HEIGHT: "missingHeight",
  MISSING_WIDTH: "missingWidth",
};

const TARGET_ELEMENTS = ["img", "iframe"];

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforces that some elements (img, iframe) have explicitly defined width and height attributes.",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("require-explicit-size"),
    } as RuleModule<[Option]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [
      {
        type: "object",
        properties: {
          allowClass: {
            type: "array",
            items: {
              type: "string",
            },
          },
          allowId: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.MISSING_HEIGHT]: "Missing `width` attribute for <{{name}}>",
      [MESSAGE_IDS.MISSING_WIDTH]: "Missing `height` attribute for <{{name}}>",
    },
  },

  create(context) {
    const allowClass = context.options?.[0]?.allowClass || [];
    const allowId = context.options?.[0]?.allowId || [];

    const allowClassSet = new Set(allowClass);
    const allowIdSet = new Set(allowId);
    return createVisitors(context, {
      Tag(node) {
        if (!TARGET_ELEMENTS.some((element) => element === getNameOf(node))) {
          return;
        }
        const classAttr = findAttr(node, "class");
        if (
          classAttr
            ?.value
            ?.value
            .split(" ")
            .some((cls) => allowClassSet.has(cls))
        ) {
          return;
        }
        const idAttr = findAttr(node, "id");
        if (idAttr?.value?.value.split(" ").some((id) => allowIdSet.has(id))) {
          return;
        }

        const width = findAttr(node, "width");
        const height = findAttr(node, "height");

        if (!height || !height.value) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.MISSING_HEIGHT,
            data: {
              name: node.name,
            },
          });
        }

        if (!width?.value) {
          context.report({
            node: node.openStart,
            messageId: MESSAGE_IDS.MISSING_WIDTH,
            data: {
              name: node.name,
            },
          });
        }
      },
    });
  },
};

export default rule;
