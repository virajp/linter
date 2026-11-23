// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-doctype.js.
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";

const MESSAGE_IDS = {
  MISSING: "missing",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require `<!DOCTYPE HTML>` in HTML",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: true,
      url: getRuleUrl("require-doctype"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: true as unknown as "code",
    schema: [],
    messages: {
      [MESSAGE_IDS.MISSING]: "Missing `<!DOCTYPE HTML>`",
    },
  },

  create(context) {
    let hasDocType = false;
    return {
      Doctype() {
        hasDocType = true;
      },
      Tag(node) {
        if (node.name !== "html") {
          return;
        }
        if (!hasDocType) {
          context.report({
            node,
            messageId: MESSAGE_IDS.MISSING,
            fix(fixer) {
              return fixer.insertTextBeforeRange([0, 0], "<!DOCTYPE html>\n");
            },
          });
        }
      },
    };
  },
};

export default rule;
