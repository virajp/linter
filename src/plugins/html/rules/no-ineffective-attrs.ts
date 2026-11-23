// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-ineffective-attrs.js.
import {
  NO_INEFFECTIVE_ATTRS_MESSAGE_IDS,
  noIneffectiveAttrs,
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

const rule: RuleModule<[]> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow HTML attributes that have no effect in their context",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-ineffective-attrs"),
    } as Rule.RuleMetaData["docs"],
    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [NO_INEFFECTIVE_ATTRS_MESSAGE_IDS.ineffective]: "{{ message }}",
    },
  },

  create(context) {
    const ruleCore: ReturnType<typeof noIneffectiveAttrs> = noIneffectiveAttrs();

    function checkAttributes(node: Tag | ScriptTag | StyleTag) {
      const adapter = createElementAdapter(node);
      const result = ruleCore.checkAttributes(adapter);
      for (const { loc, messageId, data } of result) {
        context.report({
          loc,
          messageId,
          data,
        });
      }
    }

    return createVisitors(context, {
      Tag: checkAttributes,
      ScriptTag: checkAttributes,
      StyleTag: checkAttributes,
    });
  },
};

export default rule;
