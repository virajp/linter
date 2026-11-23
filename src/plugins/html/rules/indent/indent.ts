// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/indent/indent.js.
import { NODE_TYPES } from "@html-eslint/parser";
import type {
  AnyNode,
  CloseTemplate,
  OpenTemplate,
  ScriptTag,
  StyleTag,
  Tag,
  TemplateLiteral,
  TemplateText,
  Text,
} from "@html-eslint/types";
import type {
  AST,
  Rule,
} from "eslint";
import { RULE_CATEGORY } from "../../constants/index.js";
import type {
  Context,
  Line,
  RuleListener,
  RuleModule,
} from "../../types/index.js";
import {
  isLine,
  isRangesOverlap,
  isScript,
  isStyle,
  isTag,
  isText,
  splitToLineNodes,
} from "../../utils/node.js";
import {
  shouldCheckTaggedTemplateExpression,
  shouldCheckTemplateLiteral,
} from "../../utils/settings.js";
import { getSourceCode } from "../../utils/source-code.js";
import { parseTemplateLiteral } from "../../utils/template-literal.js";
import IndentLevel from "./indent-level.js";

type AnyNodeOrLine = AnyNode | Line;

type IndentType = {
  TAB: "tab";
  SPACE: "space";
};

type MessageId = {
  WRONG_INDENT: "wrongIndent";
};

type IndentOptionInfo = {
  indentType: IndentType["TAB"] | IndentType["SPACE"];
  indentSize: number;
  indentChar: string;
};

type Option1 = "tab" | number;

type Option2 = {
  Attribute?: number;
  tagChildrenIndent?: Record<string, number>;
  ignoreComment?: boolean;
  templateIndentBase?: "first" | "templateTag";
};

const MESSAGE_ID: MessageId = {
  WRONG_INDENT: "wrongIndent",
};

const INDENT_TYPES: IndentType = {
  TAB: "tab",
  SPACE: "space",
};

const IGNORING_NODES = ["pre", "xmp"];

const rule: RuleModule<[Option1, Option2]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce consistent indentation",
      category: RULE_CATEGORY.STYLE,
      recommended: true,
    } as Rule.RuleMetaData["docs"],

    fixable: true as unknown as "code",
    schema: [
      {
        oneOf: [
          {
            enum: ["tab"],
          },
          {
            type: "integer",
            minimum: 0,
          },
        ],
      },
      {
        type: "object",
        properties: {
          Attribute: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          tagChildrenIndent: {
            default: {},
            type: "object",
            patternProperties: {
              "^[a-z]+$": {
                type: "integer",
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          ignoreComment: {
            type: "boolean",
            default: false,
          },
          templateIndentBase: {
            type: "string",
            enum: ["first", "templateTag"],
            default: "templateTag",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_ID.WRONG_INDENT]: "Expected indentation of {{expected}} but found {{actual}}.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    const indentLevelOptions = (context.options && context.options[1]) || {};
    const lines = sourceCode.getLines();
    const ignoreComment = indentLevelOptions.ignoreComment === true;
    const autoBaseIndent = indentLevelOptions.templateIndentBase === "first";
    const { indentType, indentSize, indentChar } = getIndentOptionInfo(context);
    const visitedTextLines: number[] = [];

    function getTagIncreasingLevel(
      node: Tag | ScriptTag | StyleTag | Text,
    ): number {
      if (
        node.parent
        && isTag(node.parent)
        && indentLevelOptions
        && typeof indentLevelOptions.tagChildrenIndent === "object"
        && indentLevelOptions.tagChildrenIndent
      ) {
        const option = indentLevelOptions.tagChildrenIndent[node.parent.name.toLowerCase()];
        if (typeof option === "number") {
          return option;
        }
      }

      return 1;
    }

    function getIncreasingLevel(node: AnyNode): number {
      if (isLine(node)) {
        return 1;
      }
      if (isTag(node) || isScript(node) || isStyle(node) || isText(node)) {
        return getTagIncreasingLevel(node);
      }
      if (node.type === NODE_TYPES.Attribute) {
        const optionIndent = indentLevelOptions[node.type];
        if (typeof optionIndent === "number") {
          return optionIndent;
        }
      }
      return 1;
    }

    function getAutoBaseSpaces(node: TemplateLiteral): number {
      if (!autoBaseIndent) {
        return 0;
      }
      const startLineIndex = node.loc.start.line;
      const endLineIndex = node.loc.end.line - 1;
      const templateLines = lines.slice(startLineIndex, endLineIndex);
      for (let i = 0; i < templateLines.length; i++) {
        const line = templateLines[i]!;
        if (line.trim()) {
          return countLeftPadding(line);
        }
      }
      return 0;
    }

    function getTemplateLiteralBaseIndentLevel(node: TemplateLiteral): number {
      if (autoBaseIndent) {
        return 0;
      }
      const lineIndex = node.loc.start.line - 1;
      const line = lines[lineIndex]!;

      const spaceCount = countLeftPadding(line);
      if (indentType === "space") {
        return Math.floor(spaceCount / indentSize) + 1;
      } else {
        return spaceCount + 1;
      }
    }

    /**
     * Returns true when a line with hasCloseTemplate should skip indent check.
     * Skip when there is non-whitespace content before the close delimiter on
     * the line, meaning the line is expression content (JS code) rather than an
     * HTML-structural closing line.
     */
    function shouldSkipCloseTemplateLine(
      lineNode: Line,
      parts: Text["parts"],
    ): boolean {
      const sourceLines = sourceCode.getLines();
      for (const part of parts || []) {
        if (
          part.type !== NODE_TYPES.Template
          || !part.close
          || !isRangesOverlap(part.close.range, lineNode.range)
        ) {
          continue;
        }

        // Skip when non-whitespace content precedes the close delimiter on the line
        // — that content is JS expression code, not HTML structure
        const closeLineContent = sourceLines[part.close.loc.start.line - 1]!;
        const contentBeforeClose = closeLineContent.slice(
          0,
          part.close.loc.start.column,
        );
        if (!contentBeforeClose.trim()) { continue; }

        return true;
      }
      return false;
    }

    function createIndentVisitor(baseLevel: number, baseSpaces: number) {
      const indentLevel = new IndentLevel({
        getIncreasingLevel,
      });
      indentLevel.setBase(baseLevel);

      let parentIgnoringChildCount = 0;

      function getActualIndent(
        node: AnyNode | Line | TemplateText | OpenTemplate,
      ): string {
        const lines = sourceCode.getLines();
        const line = lines[node.loc.start.line - 1]!;
        let { column } = node.loc.start;

        if (isLine(node)) {
          column += countLeftPadding(node.value);
        }

        return line.slice(0, column);
      }

      function getExpectedIndent(): string {
        // eslint-disable-next-line no-useless-assignment -- ported upstream code
        let base = "";
        if (indentType === "space") {
          base = " ".repeat(baseSpaces);
        } else {
          base = indentChar.repeat(baseSpaces);
        }

        return base + indentChar.repeat(indentLevel.value());
      }

      function getMessageData(
        actualIndent: string,
        expectedIndentSize: number,
      ) {
        const actualTabs = (actualIndent.match(/\t/g) || []).length;
        const actualSpaces = (actualIndent.match(/[^\S\t\n\r]/g) || []).length;
        let actual = "";
        if (!actualTabs && !actualSpaces) {
          actual = "no indent";
        } else {
          if (actualTabs) {
            actual += `${actualTabs} tab`;
          }
          if (actualSpaces) {
            if (actual) {
              actual += ", ";
            }
            actual += `${actualSpaces} space`;
          }
        }

        if (indentType === "space") {
          expectedIndentSize *= indentSize;
        }

        return {
          actual,
          expected: `${expectedIndentSize} ${indentType}`,
        };
      }

      function checkIndent(
        node: AnyNode | Line | TemplateText | OpenTemplate,
      ) {
        if (parentIgnoringChildCount > 0) {
          return;
        }
        const actualIndent = getActualIndent(node);
        const expectedIndent = getExpectedIndent();
        if (actualIndent.trim().length) {
          return;
        }
        if (actualIndent !== expectedIndent) {
          const targetNode = getIndentNodeToReport(node, actualIndent);
          context.report({
            loc: targetNode.loc,
            messageId: MESSAGE_ID.WRONG_INDENT,
            data: getMessageData(actualIndent, indentLevel.value()),
            fix(fixer) {
              return fixer.replaceTextRange(targetNode.range, expectedIndent);
            },
          });
        }
      }

      const commentVisitor: RuleListener = {
        "Comment"(node) {
          indentLevel.indent(node);
        },
        "CommentOpen": checkIndent,
        "CommentContent"(node) {
          indentLevel.indent(node);
          const lineNodes = splitToLineNodes(node);
          lineNodes.forEach((lineNode) => {
            if (
              lineNode.isOverlapTemplate
              && !lineNode.hasCloseTemplate
              && !lineNode.hasOpenTemplate
            ) {
              return;
            }
            if (lineNode.value.trim().length) {
              checkIndent(lineNode);
            }
          });
        },
        "CommentClose": checkIndent,
        "Comment:exit"(node) {
          indentLevel.dedent(node);
        },
        "CommentContent:exit"(node) {
          indentLevel.dedent(node);
        },
      };

      const visitor: RuleListener = {
        "Tag"(node) {
          if (IGNORING_NODES.includes(node.name)) {
            parentIgnoringChildCount++;
          }
          indentLevel.indent(node);
        },
        "ScriptTag"(node) {
          indentLevel.indent(node);
        },
        "ScriptTag:exit"(node) {
          indentLevel.dedent(node);
        },
        "OpenScriptTagStart": checkIndent,
        "OpenScriptTagEnd": checkIndent,
        "CloseScriptTag": checkIndent,
        "StyleTag"(node) {
          indentLevel.indent(node);
        },
        "StyleTag:exit"(node) {
          indentLevel.dedent(node);
        },
        "OpenStyleTagStart": checkIndent,
        "OpenStyleTagEnd": checkIndent,
        "CloseStyleTag": checkIndent,
        "OpenTagStart": checkIndent,
        "OpenTagEnd"(node) {
          checkIndent(node);
        },
        "CloseTag": checkIndent,
        "Tag:exit"(node) {
          if (IGNORING_NODES.includes(node.name)) {
            parentIgnoringChildCount--;
          }
          indentLevel.dedent(node);
        },

        "Attribute"(node) {
          indentLevel.indent(node);
        },
        "AttributeKey": checkIndent,
        "AttributeValue": checkIndent,
        "Attribute:exit"(node) {
          indentLevel.dedent(node);
        },
        "Text"(node) {
          indentLevel.indent(node);
          const lineNodes = splitToLineNodes(node);
          lineNodes.forEach((lineNode) => {
            if (visitedTextLines.includes(lineNode.loc.start.line)) {
              return;
            }
            if (
              lineNode.isOverlapTemplate
              && !lineNode.hasCloseTemplate
              && !lineNode.hasOpenTemplate
            ) {
              return;
            }
            if (
              lineNode.hasCloseTemplate
              && !lineNode.hasOpenTemplate
              && shouldSkipCloseTemplateLine(lineNode, node.parts)
            ) {
              return;
            }
            if (lineNode.value.trim().length) {
              visitedTextLines.push(lineNode.loc.start.line);
              checkIndent(lineNode);
            }
          });
        },
        "Text:exit"(node) {
          indentLevel.dedent(node);
        },
        ...(ignoreComment ? {} : commentVisitor),
      };
      return visitor;
    }

    return {
      ...createIndentVisitor(0, 0),
      "TaggedTemplateExpression:exit"(node) {
        if (shouldCheckTaggedTemplateExpression(node, context)) {
          const base = getTemplateLiteralBaseIndentLevel(node.quasi);
          const baseSpaces = getAutoBaseSpaces(node.quasi);
          parseTemplateLiteral(
            node.quasi,
            getSourceCode(context),
            createIndentVisitor(base, baseSpaces),
          );
        }
      },
      "TemplateLiteral:exit"(node) {
        if (shouldCheckTemplateLiteral(node, context)) {
          const base = getTemplateLiteralBaseIndentLevel(node);
          const baseSpaces = getAutoBaseSpaces(node);
          parseTemplateLiteral(
            node,
            getSourceCode(context),
            createIndentVisitor(base, baseSpaces),
          );
        }
      },
    };
  },
};

export default rule;

function getIndentNodeToReport(
  node: AnyNodeOrLine | TemplateText | OpenTemplate | CloseTemplate,
  actualIndent: string,
): { range: AST.Range; loc: AST.SourceLocation } {
  let rangeStart = node.range[0];

  if (!isLine(node)) {
    rangeStart -= actualIndent.length;
  }

  return {
    range: [rangeStart, rangeStart + actualIndent.length],
    loc: {
      start: {
        column: 0,
        line: node.loc.start.line,
      },
      end: {
        column: actualIndent.length,
        line: node.loc.start.line,
      },
    },
  };
}

function countLeftPadding(str: string): number {
  return str.length - str.replace(/^[\s\t]+/, "").length;
}

function getIndentOptionInfo({ options }: Context<any[]>): IndentOptionInfo {
  let indentType: IndentType["SPACE"] | IndentType["TAB"] = INDENT_TYPES.SPACE;
  let indentSize = 4;
  if (options.length) {
    if (options[0] === INDENT_TYPES.TAB) {
      indentType = INDENT_TYPES.TAB;
    } else {
      indentSize = options[0];
    }
  }
  const indentChar = indentType === INDENT_TYPES.SPACE
    ? " ".repeat(indentSize)
    : "\t";
  return { indentType, indentSize, indentChar };
}
