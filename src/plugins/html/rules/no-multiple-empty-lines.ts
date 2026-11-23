// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-multiple-empty-lines.js.
import type {
  CommentContent,
  Text,
} from "@html-eslint/types";
import type { AnyToken } from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import {
  codeToLines,
  getTemplateTokens,
  isRangesOverlap,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import {
  shouldCheckTaggedTemplateExpression,
  shouldCheckTemplateLiteral,
} from "../utils/settings.js";
import { getSourceCode } from "../utils/source-code.js";
import { parseTemplateLiteral } from "../utils/template-literal.js";

type Option = {
  max: number;
};

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow multiple empty lines",
      category: RULE_CATEGORY.STYLE,
      recommended: false,
      url: getRuleUrl("no-multiple-empty-lines"),
    } as Rule.RuleMetaData["docs"],

    fixable: "whitespace",
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "integer",
            minimum: 0,
          },
        },
        required: ["max"],
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "More than {{max}} blank lines not allowed.",
    },
  },

  create(context) {
    const max = context.options.length ? context.options[0].max : 2;
    const sourceCode = getSourceCode(context);

    function check(
      lines: string[],
      lineOffset: number,
      tokens: (CommentContent | Text)["parts"][number][],
    ) {
      const nonEmptyLineNumbers: number[] = [];

      lines.forEach((line, index) => {
        if (line.trim().length > 0) {
          nonEmptyLineNumbers.push(index + lineOffset);
        }
      });

      nonEmptyLineNumbers.forEach((current, index, arr) => {
        const before = arr[index - 1];
        if (typeof before === "number") {
          if (current - before - 1 > max) {
            const start = sourceCode.getIndexFromLoc({
              line: before + 1,
              column: 0,
            });
            const end = sourceCode.getIndexFromLoc({
              line: current - max,
              column: 0,
            });
            if (
              tokens.some((token) => isRangesOverlap(token.range, [start, end]))
            ) {
              return;
            }

            context.report({
              loc: {
                start: { line: before, column: 0 },
                end: { line: current, column: 0 },
              },
              messageId: MESSAGE_IDS.UNEXPECTED,
              data: {
                max: `${max}`,
              },
              fix(fixer) {
                return fixer.removeRange([start, end]);
              },
            });
          }
        }
      });
    }
    return {
      "Document:exit"() {
        check(sourceCode.lines, 1, []);
      },
      "TaggedTemplateExpression"(node) {
        if (shouldCheckTaggedTemplateExpression(node, context)) {
          const { html, tokens } = parseTemplateLiteral(
            node.quasi,
            getSourceCode(context),
          );
          const lines = codeToLines(html);
          check(
            lines,
            (node.quasi as { loc: { start: { line: number } } })
              .loc
              .start
              .line,
            getTemplateTokens(tokens as unknown as AnyToken[]),
          );
        }
      },
      "TemplateLiteral"(node) {
        if (shouldCheckTemplateLiteral(node, context)) {
          const { html, tokens } = parseTemplateLiteral(
            node,
            getSourceCode(context),
          );
          const lines = codeToLines(html);
          check(
            lines,
            (node as { loc: { start: { line: number } } }).loc.start.line,
            getTemplateTokens(tokens as unknown as AnyToken[]),
          );
        }
      },
    };
  },
};

export default rule;
