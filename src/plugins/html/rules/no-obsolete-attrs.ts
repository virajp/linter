// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-obsolete-attrs.js.
import {
  NO_OBSOLETE_ATTRS_MESSAGE_IDS,
  noObsoleteAttrs,
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
    type: "code" as "problem",

    docs: {
      description: "Disallow use of obsolete attributes in HTML5",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: true,
      url: getRuleUrl("no-obsolete-attrs"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [NO_OBSOLETE_ATTRS_MESSAGE_IDS.obsolete]: "The {{attr}} attribute on <{{element}}> is obsolete. {{suggestion}}",
    },
  },

  create(context) {
    const ruleCore = noObsoleteAttrs();

    function checkObsoleteAttrs(node: Tag | ScriptTag | StyleTag) {
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
      Tag: checkObsoleteAttrs,
      ScriptTag: checkObsoleteAttrs,
      StyleTag: checkObsoleteAttrs,
    });
  },
};

export default rule;
