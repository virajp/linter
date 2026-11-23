// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-redundant-role.js.
import { NODE_TYPES } from "@html-eslint/parser";
import { element } from "html-standard";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  REDUNDANT: "redundant",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow redundant role attributes that match the element's implicit role",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: false,
      url: getRuleUrl("no-redundant-role"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: "code",
    schema: [],
    messages: {
      [MESSAGE_IDS.REDUNDANT]:
        "Redundant role '{{role}}'. The element <{{element}}> already has an implicit role of '{{role}}'.",
    },
  },

  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const role = findAttr(node, "role");
        if (!role?.value?.value) {
          return;
        }

        /** Allow template expression. ex: html`<div role=${role}></div>` */
        if (
          role.value.parts.some((part) => part.type === NODE_TYPES.Template)
        ) {
          return;
        }

        const roleValue = role.value.value.toLowerCase();

        const elem = element(node.name, {
          attributes: {
            get(key: string) {
              const attr = findAttr(node, key);
              if (attr?.value) {
                return attr.value.value;
              }
              return null;
            },
          },
        });

        const implicitRole = elem.implicitRole();

        if (implicitRole?.toLowerCase() === roleValue) {
          context.report({
            node: role,
            messageId: MESSAGE_IDS.REDUNDANT,
            data: {
              role: roleValue,
              element: node.name,
            },
            fix(fixer) {
              return fixer.removeRange(role.range);
            },
          });
        }
      },
    });
  },
};

export default rule;
