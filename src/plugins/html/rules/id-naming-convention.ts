// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/id-naming-convention.js.
import {
  ID_NAMING_CONVENTION_MESSAGE_IDS,
  ID_NAMING_CONVENTIONS,
  idNamingConvention,
} from "@html-eslint/core";
import type { IdNamingConventionOptions } from "@html-eslint/core";
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

const rule: RuleModule<IdNamingConventionOptions> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce consistent naming of id attributes",
      category: RULE_CATEGORY.STYLE,
      recommended: false,
      url: getRuleUrl("id-naming-convention"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [
      {
        enum: Object.values(ID_NAMING_CONVENTIONS),
      },
      {
        type: "object",
        properties: {
          pattern: { type: "string" },
          flags: { type: "string" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [ID_NAMING_CONVENTION_MESSAGE_IDS.wrong]: "The id '{{actual}}' is not matched with the {{convention}}.",
    },
  },

  create(context) {
    const { checkAttributes } = idNamingConvention(context.options);

    function check(node: Tag | ScriptTag | StyleTag) {
      const adapter = createElementAdapter(node);
      const result = checkAttributes(adapter);
      for (const item of result) {
        context.report({
          loc: item.loc,
          messageId: item.messageId,
          data: item.data,
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
