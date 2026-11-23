// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-abstract-roles.js.
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const ABSTRACT_ROLE_SET = new Set([
  "command",
  "composite",
  "input",
  "landmark",
  "range",
  "roletype",
  "section",
  "sectionhead",
  "select",
  "structure",
  "widget",
  "window",
]);

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow use of abstract roles",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-abstract-roles"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected use of an abstract role.",
    },
  },

  create(context) {
    function check(node: Tag | ScriptTag | StyleTag) {
      const roleAttr = findAttr(node, "role");
      if (roleAttr?.value && ABSTRACT_ROLE_SET.has(roleAttr.value.value)) {
        context.report({
          messageId: MESSAGE_IDS.UNEXPECTED,
          node: roleAttr,
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
