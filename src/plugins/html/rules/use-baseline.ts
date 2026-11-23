// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/use-baseline.js.
import {
  USE_BASELINE_MESSAGE_IDS,
  useBaseline,
} from "@html-eslint/core";
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

type Option = {
  available: "widely" | "newly" | number;
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",
    docs: {
      description: "Enforce the use of baseline features.",
      recommended: true,
      category: RULE_CATEGORY.BEST_PRACTICE,
      url: getRuleUrl("use-baseline"),
    } as RuleModule<[Option]>["meta"]["docs"],
    fixable: null as unknown as undefined,
    schema: [
      {
        type: "object",
        properties: {
          available: {
            anyOf: [
              {
                enum: ["widely", "newly"],
              },
              {
                // baseline year
                type: "integer",
                minimum: 2000,
                maximum: new Date().getFullYear(),
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      [USE_BASELINE_MESSAGE_IDS.noBaselineElement]:
        "Element '{{element}}' is not a {{availability}} available baseline feature.",
      [USE_BASELINE_MESSAGE_IDS.notBaselineElementAttribute]:
        "Attribute '{{attr}}' on '{{element}}' is not a {{availability}} available baseline feature.",
      [USE_BASELINE_MESSAGE_IDS.notBaselineGlobalAttribute]:
        "Attribute '{{attr}}' is not a {{availability}} available baseline feature.",
    },
  },

  create(context) {
    const options = context.options[0] || { available: "widely" };
    const { checkAttributes } = useBaseline(options);
    function check(node: Tag | ScriptTag | StyleTag) {
      const adapter = createElementAdapter(node);
      const result = checkAttributes(adapter);

      for (const { messageId, data, loc } of result) {
        context.report({
          loc,
          messageId,
          data,
        });
      }
    }

    return createVisitors(context, {
      ScriptTag: check,
      StyleTag: check,
      Tag: check,
    });
  },
};

export default rule;
