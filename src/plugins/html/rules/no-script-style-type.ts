// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-script-style-type.js.
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  UNNECESSARY: "unnecessary",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce to omit type attributes for style sheets and scripts",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("no-script-style-type"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: "code",
    schema: [],
    messages: {
      [MESSAGE_IDS.UNNECESSARY]: "Unnecessary type attributes",
    },
  },

  create(context) {
    function check(
      node: ScriptTag | Tag | StyleTag,
      unnecessaryValue: string,
    ) {
      const type = findAttr(node, "type");
      if (type?.value?.value?.trim().toLocaleLowerCase() === unnecessaryValue) {
        context.report({
          node: type,
          messageId: MESSAGE_IDS.UNNECESSARY,
          fix(fixer) {
            return fixer.remove(type);
          },
        });
      }
    }
    return createVisitors(context, {
      ScriptTag(node) {
        check(node, "text/javascript");
      },
      StyleTag(node) {
        check(node, "text/css");
      },
      Tag(node) {
        if (node.name === "link") {
          const rel = findAttr(node, "rel");
          if (rel?.value?.value === "stylesheet") {
            check(node, "text/css");
          }
        }
      },
    });
  },
};

export default rule;
