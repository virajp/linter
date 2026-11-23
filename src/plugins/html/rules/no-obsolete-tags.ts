// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-obsolete-tags.js.
import {
  NO_OBSOLETE_TAGS_MESSAGE_IDS,
  noObsoleteTags,
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
      description: "Disallow use of obsolete elements in HTML5",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: true,
      url: getRuleUrl("no-obsolete-tags"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [NO_OBSOLETE_TAGS_MESSAGE_IDS.unexpected]: "Unexpected use of obsolete tag <{{tag}}>",
    },
  },

  create(context) {
    const { checkElement } = noObsoleteTags();

    function check(node: Tag | ScriptTag | StyleTag) {
      const adapter = createElementAdapter(node);
      const result = checkElement(adapter);
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
