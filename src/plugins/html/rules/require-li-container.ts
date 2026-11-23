// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-li-container.js.
import {
  REQUIRE_LI_CONTAINER_MESSAGE_IDS,
  requireLiContainer,
} from "@html-eslint/core";
import type { Tag } from "@html-eslint/types";
import { createElementAdapter } from "../adapters/factory.js";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce `<li>` to be in `<ul>`, `<ol>` or `<menu>`.",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: true,
      url: getRuleUrl("require-li-container"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [REQUIRE_LI_CONTAINER_MESSAGE_IDS.invalid]:
        "Invalid container of `<li>`. <li>` should be in `<ul>`, `<ol>` or `<menu>`.",
    },
  },

  create(context) {
    const { checkElement } = requireLiContainer();

    function check(node: Tag) {
      if (node.name !== "li") {
        return;
      }
      const adapter = createElementAdapter(node);
      const result = checkElement(adapter);
      for (const { loc, messageId } of result) {
        context.report({
          loc,
          messageId,
        });
      }
    }

    return {
      Tag: check,
    };
  },
};

export default rule;
