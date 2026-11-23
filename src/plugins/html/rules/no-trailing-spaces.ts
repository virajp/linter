// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-trailing-spaces.js.
import type {
  CommentContent,
  Text,
} from "@html-eslint/types";
import type { AST } from "eslint";
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

const MESSAGE_IDS = {
  TRAILING_SPACE: "trailingSpace",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow trailing whitespace at the end of lines",
      recommended: false,
      category: RULE_CATEGORY.STYLE,
      url: getRuleUrl("no-trailing-spaces"),
    } as RuleModule<[]>["meta"]["docs"],
    fixable: true as unknown as "code",
    schema: [],
    messages: {
      [MESSAGE_IDS.TRAILING_SPACE]: "Trailing spaces not allowed",
    },
  },

  create(context) {
    const sourceCode = getSourceCode(context);
    function check(
      source: string,
      lines: string[],
      offset: { range: number; line: number; column: number },
      tokens: (CommentContent | Text)["parts"][number][],
    ) {
      const lineBreaks = source.match(/\r\n|[\r\n\u2028\u2029]/gu);

      lines.forEach((line, index) => {
        const lineNumber = index + offset.line;
        const match = line.match(/[ \t\u00a0\u2000-\u200b\u3000]+$/);
        const lineBreakLength = lineBreaks?.[index]?.length ?? 1;
        const lineLength = line.length + lineBreakLength;
        const columnOffset = index === 0 ? offset.column : 0;
        if (match) {
          if (typeof match.index === "number" && match.index > 0) {
            const loc = {
              start: {
                line: lineNumber,
                column: match.index + columnOffset,
              },
              end: {
                line: lineNumber,
                column: lineLength - lineBreakLength + columnOffset,
              },
            };
            const start = sourceCode.getIndexFromLoc(loc.start);
            const end = sourceCode.getIndexFromLoc(loc.end);
            if (
              tokens.some((token) => isRangesOverlap(token.range, [start, end]))
            ) {
              return;
            }
            context.report({
              messageId: MESSAGE_IDS.TRAILING_SPACE,
              loc,
              fix(fixer) {
                return fixer.removeRange([start, end] as AST.Range);
              },
            });
          }
        }
      });
    }

    return {
      Document() {
        check(
          sourceCode.getText(),
          sourceCode.getLines(),
          {
            range: 0,
            line: 1,
            column: 0,
          },
          [],
        );
      },
      TaggedTemplateExpression(node) {
        if (shouldCheckTaggedTemplateExpression(node, context)) {
          const { html, tokens } = parseTemplateLiteral(
            node.quasi,
            getSourceCode(context),
          );
          const lines = codeToLines(html);
          check(
            html,
            lines,
            {
              range: node.quasi.range[0] + 1,
              line: node.quasi.loc.start.line,
              column: node.quasi.loc.start.column + 1,
            },
            getTemplateTokens(tokens as any),
          );
        }
      },
      TemplateLiteral(node) {
        if (shouldCheckTemplateLiteral(node, context)) {
          const { html, tokens } = parseTemplateLiteral(
            node,
            getSourceCode(context),
          );
          const lines = codeToLines(html);
          check(
            html,
            lines,
            {
              range: node.range[0] + 1,
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
            getTemplateTokens(tokens as any),
          );
        }
      },
    };
  },
};

export default rule;
