// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/utils/node.js.
import { NODE_TYPES } from "@html-eslint/parser";
import type {
  AnyNode,
  AnyToken,
  Attribute,
  AttributeKey,
  AttributeValue,
  Comment,
  CommentContent,
  ScriptTag,
  StyleTag,
  Tag,
  Text,
} from "@html-eslint/types";
import type { AST } from "eslint";
import type {
  BaseNode,
  Line,
} from "../types/index.js";

export function findAttr(
  node: Tag | ScriptTag | StyleTag,
  key: string,
): Attribute | undefined {
  return node.attributes.find(
    (attr) => attr.key && attr.key.value.toLowerCase() === key.toLowerCase(),
  );
}

export function hasAttr(node: Tag | ScriptTag, attrName: string): boolean {
  return node.attributes.some(
    (a) => a.type === "Attribute" && a.key.value === attrName,
  );
}

/**
 * Checks whether a node's attributes is empty or not.
 */
export function isAttributesEmpty(node: Tag | ScriptTag | StyleTag): boolean {
  return !node.attributes || node.attributes.length <= 0;
}

/**
 * True if the attribute exists and its value is non-empty and not only
 * whitespace.
 */
export function hasNonWhitespaceValue(
  attrName: Tag["attributes"][number] | undefined,
) {
  return Boolean(
    attrName?.value?.value && attrName.value.value.trim().length > 0,
  );
}

/**
 * Checks whether a node's all tokens are on the same line or not.
 *
 * @param node A node to check
 * @returns `true` if a node's tokens are on the same line, otherwise
 *   `false`.
 */
export function isNodeTokensOnSameLine(node: AnyNode): boolean {
  return node.loc.start.line === node.loc.end.line;
}

export function isRangesOverlap(rangeA: AST.Range, rangeB: AST.Range): boolean {
  return rangeA[0] < rangeB[1] && rangeB[0] < rangeA[1];
}

export function isOverlapWithTemplates(
  parts: (Text | CommentContent)["parts"],
  range: AST.Range,
): boolean {
  return parts
    .filter((part) => part.type !== NODE_TYPES.Part)
    .some((part) => isRangesOverlap(part.range, range));
}

export function hasTemplate(
  node: AttributeKey | AttributeValue | Text | CommentContent,
): boolean {
  return node.parts.some((part) => part.type !== NODE_TYPES.Part);
}

export function splitToLineNodes(node: Text | CommentContent): Line[] {
  let start = node.range[0];
  let { line } = node.loc.start;
  const startCol = node.loc.start.column;
  const lineNodes: Line[] = [];
  const parts = node.parts || [];

  function getTemplateInfo(range: AST.Range): {
    isOverlapTemplate: boolean;
    hasOpenTemplate: boolean;
    hasCloseTemplate: boolean;
  } {
    let isOverlapTemplate = false;
    let hasOpenTemplate = false;
    let hasCloseTemplate = false;
    for (const part of parts) {
      if (part.type === NODE_TYPES.Template) {
        if (isRangesOverlap(part.range, range)) {
          isOverlapTemplate = true;
        }
        if (part.open && isRangesOverlap(part.open.range, range)) {
          hasOpenTemplate = true;
        }
        if (part.close && isRangesOverlap(part.close.range, range)) {
          hasCloseTemplate = true;
        }
      }
    }
    return {
      isOverlapTemplate,
      hasCloseTemplate,
      hasOpenTemplate,
    };
  }

  node.value.split("\n").forEach((value, index) => {
    const columnStart = index === 0 ? startCol : 0;
    const range: AST.Range = [start, start + value.length];
    const loc = {
      start: {
        line,
        column: columnStart,
      },
      end: {
        line,
        column: columnStart + value.length,
      },
    };
    const lineNode: Line = {
      type: "Line",
      value,
      range,
      loc,
      ...getTemplateInfo(range),
    };

    start += value.length + 1;
    line += 1;

    lineNodes.push(lineNode);
  });

  return lineNodes;
}

/**
 * Get location between two nodes.
 *
 * @param before A node placed in before
 * @param after A node placed in after
 * @returns Location between two nodes.
 */
export function getLocBetween(
  before: { loc: AST.SourceLocation },
  after: { loc: AST.SourceLocation },
): AST.SourceLocation {
  return {
    start: before.loc.end,
    end: after.loc.start,
  };
}

export function isTag(node: BaseNode): node is Tag {
  return node.type === NODE_TYPES.Tag;
}

export function isScript(node: BaseNode): node is ScriptTag {
  return node.type === NODE_TYPES.ScriptTag;
}

export function isStyle(node: BaseNode): node is StyleTag {
  return node.type === NODE_TYPES.StyleTag;
}

export function isComment(node: BaseNode): node is Comment {
  return node.type === NODE_TYPES.Comment;
}

export function isText(node: BaseNode): node is Text {
  return node.type === NODE_TYPES.Text;
}

export function isLine(node: BaseNode): node is Line {
  return node.type === "Line";
}

const lineBreakPattern = /\r\n|[\r\n\u2028\u2029]/u;
const lineEndingPattern = new RegExp(lineBreakPattern.source, "gu");

export function codeToLines(source: string): string[] {
  return source.split(lineEndingPattern);
}

export function findParent(
  node: AnyNode,
  predicate: (node: AnyNode) => boolean,
): null | AnyNode {
  if (!node.parent) {
    return null;
  }
  if (
    node.type === "TaggedTemplateExpression"
    || node.type === "TemplateLiteral"
    || node.type === "TemplateElement"
  ) {
    return null;
  }
  if (predicate(node.parent as AnyNode)) {
    return node.parent as AnyNode;
  }
  return findParent(node.parent as AnyNode, predicate);
}

export function getTemplateTokens(
  tokens: AnyToken[],
): (CommentContent | Text)["parts"][number][] {
  return (
    ([] as any[])
      .concat(
        ...tokens
          .map((token) => (token as any)["parts"] || []),
      )
      .filter((token) => token.type !== NODE_TYPES.Part)
  );
}

export function getNameOf(node: Tag | ScriptTag | StyleTag): string {
  if (isScript(node)) {
    return "script";
  }
  if (isStyle(node)) {
    return "style";
  }
  return node.name.toLowerCase();
}
