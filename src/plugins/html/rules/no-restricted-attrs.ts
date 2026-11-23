// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-restricted-attrs.js.
import {
  NO_RESTRICTED_ATTRS_MESSAGE_IDS,
  noRestrictedAttrs,
} from "@html-eslint/core";
import type { NoRestrictedAttrsOptions } from "@html-eslint/core";
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import { createElementAdapter } from "../adapters/factory.js";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const rule: RuleModule<NoRestrictedAttrsOptions> = {
  meta: {
    type: "problem",

    docs: {
      description: "Disallow specified attributes",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-restricted-attrs"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: {
      type: "array",

      items: {
        type: "object",
        required: ["tagPatterns", "attrPatterns"],
        properties: {
          tagPatterns: {
            type: "array",
            items: {
              type: "string",
            },
          },
          attrPatterns: {
            type: "array",
            items: {
              type: "string",
            },
          },
          message: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
    },
    messages: {
      [NO_RESTRICTED_ATTRS_MESSAGE_IDS.restricted]: "'{{attr}}' is restricted from being used.",
    },
  },

  create(context) {
    const { checkAttributes } = noRestrictedAttrs(context.options);

    function check(node: Tag | StyleTag | ScriptTag) {
      const adapter = createElementAdapter(node);
      const result = checkAttributes(adapter);
      for (const item of result) {
        context.report({
          loc: item.loc,
          ...("messageId" in item
            ? { messageId: item.messageId }
            : { message: item.message }),
          data: item.data,
        });
      }
    }

    return createVisitors(context, {
      Tag: check,
      StyleTag: check,
      ScriptTag: check,
    });
  },
};

export default rule;
