// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-extra-spacing-text.js.
import type {
  Comment,
  CommentContent,
  Tag,
  Text,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  isOverlapWithTemplates,
  isTag,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { getSourceCode } from "../utils/source-code.js";
import { createVisitors } from "../utils/visitors.js";

type Option = {
  skip?: string[];
  skipComments?: boolean;
};

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow unnecessary consecutive spaces",
      category: RULE_CATEGORY.STYLE,
      recommended: false,
      url: getRuleUrl("no-extra-spacing-text"),
    } as Rule.RuleMetaData["docs"],

    fixable: true as unknown as "code",
    schema: [
      {
        type: "object",
        properties: {
          skip: {
            type: "array",
            items: {
              type: "string",
            },
          },
          skipComments: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Tabs and/or multiple consecutive spaces not allowed here",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const skipTags: string[] = options.skip || [];
    const skipComments = options.skipComments || false;
    const sourceCode = getSourceCode(context);
    const tagStack: Tag[] = [];

    function hasSkipTagOnParent(node: Comment | Text): boolean {
      const { parent } = node as { parent?: any };
      if (
        parent
        && isTag(parent)
        && skipTags.some((skipTag) => skipTag === parent.name)
      ) {
        return true;
      }
      return false;
    }

    function stripConsecutiveSpaces(node: CommentContent | Text) {
      const text = node.value;
      const matcher = /(^|[^\n \t])([ \t]+\n|\t[\t ]*|[ \t]{2,})/g;

      while (true) {
        const offender = matcher.exec(text);
        if (offender === null) {
          break;
        }

        const space = offender[2]!;
        const indexStart = node.range[0] + matcher.lastIndex - space.length;
        const indexEnd = indexStart + space.length;

        const hasOverlap = isOverlapWithTemplates(node.parts, [
          indexStart,
          indexEnd,
        ]);

        if (hasOverlap) {
          return;
        }

        context.report({
          node: node,
          loc: {
            start: sourceCode.getLocFromIndex(indexStart),
            end: sourceCode.getLocFromIndex(indexEnd),
          },
          messageId: MESSAGE_IDS.UNEXPECTED,
          fix(fixer) {
            return fixer.replaceTextRange(
              [indexStart, indexEnd],
              space.endsWith(`\n`) ? `\n` : ` `,
            );
          },
        });
      }
    }

    return createVisitors(context, {
      "Comment"(node) {
        if (skipComments || hasSkipTagOnParent(node)) {
          return;
        }
        stripConsecutiveSpaces(node.value);
      },
      "Text"(node) {
        if (hasSkipTagOnParent(node)) {
          return;
        }
        stripConsecutiveSpaces(node);
      },
      "Tag"(node) {
        tagStack.push(node);
        if (
          skipTags.some((skipTag) => tagStack.some((tag) => tag.name === skipTag))
        ) {
          return;
        }
      },
      "Tag:exit"() {
        tagStack.pop();
      },
    });
  },
};

export default rule;
