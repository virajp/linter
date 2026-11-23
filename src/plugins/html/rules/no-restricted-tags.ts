// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-restricted-tags.js.
import {
  NO_RESTRICTED_TAGS_MESSAGE_IDS,
  noRestrictedTags,
} from "@html-eslint/core";
import type { NoRestrictedTagsOptions } from "@html-eslint/core";
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

const rule: RuleModule<NoRestrictedTagsOptions> = {
  meta: {
    type: "problem",

    docs: {
      description: "Disallow specified tags",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-restricted-tags"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: {
      type: "array",

      items: {
        type: "object",
        required: ["tagPatterns"],
        properties: {
          tagPatterns: {
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
      [NO_RESTRICTED_TAGS_MESSAGE_IDS.restricted]: "'{{tag}}' tag is restricted from being used.",
    },
  },

  create(context) {
    const { checkElement } = noRestrictedTags(context.options);

    function check(node: Tag | StyleTag | ScriptTag) {
      const adapter = createElementAdapter(node);
      const result = checkElement(adapter);
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
