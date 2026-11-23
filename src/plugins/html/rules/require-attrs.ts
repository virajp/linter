// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-attrs.js.
import {
  REQUIRE_ATTRS_MESSAGE_IDS,
  requireAttrs,
} from "@html-eslint/core";
import type {
  RequireAttrsFix,
  RequireAttrsOptions,
} from "@html-eslint/core";
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import { createElementAdapter } from "../adapters/factory.js";
import { RULE_CATEGORY } from "../constants/index.js";
import type {
  RuleFixer,
  RuleModule,
} from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const rule: RuleModule<RequireAttrsOptions> = {
  meta: {
    type: "problem",

    docs: {
      description: "Require specified attributes",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("require-attrs"),
    } as RuleModule<[]>["meta"]["docs"],
    fixable: "code",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tag: { type: "string" },
          attr: { type: "string" },
          value: { type: "string" },
          message: { type: "string" },
          conditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                attr: { type: "string" },
                value: { type: "string" },
                kind: {
                  enum: ["present", "absent", "equal", "not-equal"],
                },
              },
              required: ["attr", "kind"],
              additionalProperties: false,
            },
          },
        },
        required: ["tag", "attr"],
        additionalProperties: false,
      },
    },
    messages: {
      [REQUIRE_ATTRS_MESSAGE_IDS.missing]: "Missing '{{attr}}' attribute on '{{tag}}' tag",
      [REQUIRE_ATTRS_MESSAGE_IDS.unexpected]: "Unexpected '{{attr}}' attribute value. '{{expected}}' is expected",
    },
  },

  create(context) {
    const { checkElement } = requireAttrs(context.options || []);

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
          fix: item.fix
            ? ((fix: RequireAttrsFix) => (fixer: RuleFixer) => fixer.replaceTextRange(fix.range, fix.text))(item.fix)
            : null,
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
