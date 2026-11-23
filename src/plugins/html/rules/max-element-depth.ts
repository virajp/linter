// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/max-element-depth.js.
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

type Option = {
  max?: number;
};

const MESSAGE_IDS = {
  MAX_DEPTH_EXCEEDED: "maxDepthExceeded",
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce maximum element depth",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("max-element-depth"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "integer",
            minimum: 1,
            default: 32,
          },
        },
        required: ["max"],
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.MAX_DEPTH_EXCEEDED]:
        "Expected the depth of nested elements to be <= {{needed}}, but found {{found}}",
    },
  },

  create(context) {
    const maxDepth = typeof context.options?.[0]?.max === "number"
      ? context.options[0].max
      : 32;

    let depth = 0;

    function resetDepth() {
      depth = 0;
    }

    function increaseDepth(node: Tag | ScriptTag | StyleTag) {
      depth++;
      if (depth > maxDepth) {
        context.report({
          node,
          messageId: MESSAGE_IDS.MAX_DEPTH_EXCEEDED,
          data: {
            needed: `${maxDepth}`,
            found: String(depth),
          },
        });
      }
    }

    function decreaseDepth() {
      depth--;
    }

    return createVisitors(context, {
      "Document": resetDepth,
      "Document:exit": resetDepth,
      "Tag": increaseDepth,
      "Tag:exit": decreaseDepth,
      "ScriptTag": increaseDepth,
      "ScriptTag:exit": decreaseDepth,
      "StyleTag": increaseDepth,
      "StyleTag:exit": decreaseDepth,
    });
  },
};

export default rule;
