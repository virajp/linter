// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-invalid-attr-value.js.
import {
  NO_INVALID_ATTR_VALUE_MESSAGE_IDS,
  noInvalidAttrValue,
} from "@html-eslint/core";
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { createElementAdapter } from "../adapters/factory.js";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const rule: RuleModule<
  [{ allow?: { tag: string; attr: string; valuePattern?: string }[] }]
> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow invalid attribute values according to HTML standards",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-invalid-attr-value"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tag: {
                  type: "string",
                },
                attr: {
                  type: "string",
                },
                valuePattern: {
                  type: "string",
                },
              },
              required: ["tag", "attr"],
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [NO_INVALID_ATTR_VALUE_MESSAGE_IDS.invalid]:
        "Invalid value '{{value}}' for attribute '{{attr}}' on <{{element}}>. {{suggestion}}",
    },
  },

  create(context) {
    const options = context.options[0] || {};

    const { checkAttributes } = noInvalidAttrValue(options);

    function check(node: Tag | ScriptTag | StyleTag) {
      const adapter = createElementAdapter(node);
      const result = checkAttributes(adapter);
      for (const { loc, messageId, data } of result) {
        context.report({
          loc,
          messageId,
          data,
        });
      }
    }

    return createVisitors(context, {
      Tag: check,
      ScriptTag: check,
      StyleTag: check,
    });
  },
};

export default rule;
