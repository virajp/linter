// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-duplicate-id.js.
import type {
  AttributeValue,
  Tag,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  areInMutuallyExclusiveBranches,
  getBranchSegments,
} from "../utils/branch-segments.js";
import { findAttr } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import {
  shouldCheckTaggedTemplateExpression,
  shouldCheckTemplateLiteral,
} from "../utils/settings.js";
import { getSourceCode } from "../utils/source-code.js";
import { parseTemplateLiteral } from "../utils/template-literal.js";

const MESSAGE_IDS = {
  DUPLICATE_ID: "duplicateId",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow duplicate id attributes",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: true,
      url: getRuleUrl("no-duplicate-id"),
    } as Rule.RuleMetaData["docs"],

    fixable: null as unknown as undefined,
    schema: [],
    messages: {
      [MESSAGE_IDS.DUPLICATE_ID]: "The id '{{id}}' is duplicated.",
    },
  },

  create(context) {
    // Read branch segments once per file.  For non-HTML files (JS tagged
    // template literal paths) this will be [] and the check degrades
    // gracefully to the original behavior.
    const branchSegments = getBranchSegments(context);

    const htmlIdAttrsMap = new Map();

    function createTagVisitor(map: Map<string, AttributeValue[]>) {
      return function(node: Tag) {
        if (!node.attributes || node.attributes.length <= 0) {
          return;
        }
        const idAttr = findAttr(node, "id");
        if (idAttr?.value) {
          if (!map.has(idAttr.value.value)) {
            map.set(idAttr.value.value, []);
          }
          const nodes = map.get(idAttr.value.value);
          if (nodes) {
            nodes.push(idAttr.value);
          }
        }
      };
    }

    function report(
      map: Map<string, AttributeValue[]>,
      segments: typeof branchSegments,
    ) {
      map.forEach((attrs) => {
        if (Array.isArray(attrs) && attrs.length > 1) {
          // If every occurrence lives in a different branch of the same
          // template if-block they are mutually exclusive at runtime — the
          // same id can never appear twice in the rendered output.
          if (areInMutuallyExclusiveBranches(attrs, segments)) {
            return;
          }
          attrs.forEach((attr) => {
            context.report({
              node: attr,
              data: { id: attr.value },
              messageId: MESSAGE_IDS.DUPLICATE_ID,
            });
          });
        }
      });
    }

    return {
      "Tag": createTagVisitor(htmlIdAttrsMap),
      "Document:exit"() {
        report(htmlIdAttrsMap, branchSegments);
      },
      "TaggedTemplateExpression"(node) {
        const idAttrsMap = new Map();
        if (shouldCheckTaggedTemplateExpression(node, context)) {
          parseTemplateLiteral(node.quasi, getSourceCode(context), {
            Tag: createTagVisitor(idAttrsMap),
          });
        }
        report(idAttrsMap, branchSegments);
      },
      "TemplateLiteral"(node) {
        const idAttrsMap = new Map();
        if (shouldCheckTemplateLiteral(node, context)) {
          parseTemplateLiteral(node, getSourceCode(context), {
            Tag: createTagVisitor(idAttrsMap),
          });
        }
        report(idAttrsMap, branchSegments);
      },
    };
  },
};

export default rule;
