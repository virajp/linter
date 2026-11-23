// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-img-alt.js.
import type { Tag } from "@html-eslint/types";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

type Option = {
  substitute?: string[];
};

const MESSAGE_IDS = {
  MISSING_ALT: "missingAlt",
  INSERT_ALT: "insertAlt",
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "suggestion",

    docs: {
      description: "Require `alt` attribute on `<img>` tag",
      category: RULE_CATEGORY.ACCESSIBILITY,
      recommended: true,
      url: getRuleUrl("require-img-alt"),
    } as RuleModule<[Option]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          substitute: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.MISSING_ALT]: "Missing `alt` attribute at `<img>` tag",
      [MESSAGE_IDS.INSERT_ALT]: "Insert `alt=\"\"` at `<img>` tag",
    },
  },

  create(context) {
    const substitute = context.options?.[0]?.substitute || [];

    return createVisitors(context, {
      Tag(node) {
        if (node.name !== "img") {
          return;
        }

        const hasAlt = hasValidAltOrSubstitute(node, substitute);
        const hasSubstituteOption = substitute.length > 0;

        if (!hasAlt) {
          context.report({
            loc: {
              start: node.openStart.loc.start,
              end: node.openEnd.loc.end,
            },
            messageId: MESSAGE_IDS.MISSING_ALT,
            suggest: hasSubstituteOption
              ? null
              : [
                {
                  messageId: MESSAGE_IDS.INSERT_ALT,
                  fix(fixer) {
                    return fixer.insertTextBefore(node.openEnd, " alt=\"\"");
                  },
                },
              ],
          });
        }
      },
    });
  },
};

function hasValidAltOrSubstitute(node: Tag, substitute: string[]): boolean {
  let hasAnyAlt = false;

  for (const attr of node.attributes) {
    if (attr.key?.value) {
      const isAltAttr = attr.key.value === "alt";
      const isSubstituteAttr = substitute.includes(attr.key.value);

      if (isAltAttr || isSubstituteAttr) {
        hasAnyAlt = true;
        break;
      }
    }
  }

  return hasAnyAlt;
}

export default rule;
