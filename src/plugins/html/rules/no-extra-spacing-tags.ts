// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/no-extra-spacing-tags.js.
import type {
  Attribute,
  OpenScriptTagStart,
  OpenStyleTagStart,
  OpenTagStart,
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getLocBetween } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { getSourceCode } from "../utils/source-code.js";
import { createVisitors } from "../utils/visitors.js";

type Option = {
  disallowInAssignment?: boolean;
  disallowMissing?: boolean;
  disallowTabs?: boolean;
  enforceBeforeSelfClose?: boolean;
};

const MESSAGE_IDS = {
  EXTRA_BETWEEN: "unexpectedBetween",
  EXTRA_AFTER: "unexpectedAfter",
  EXTRA_BEFORE: "unexpectedBefore",
  EXTRA_BEFORE_CLOSE: "unexpectedBeforeClose",
  EXTRA_IN_ASSIGNMENT: "unexpectedInAssignment",
  MISSING_BEFORE: "missingBefore",
  MISSING_BEFORE_SELF_CLOSE: "missingBeforeSelfClose",
  EXTRA_BEFORE_SELF_CLOSE: "unexpectedBeforeSelfClose",
  EXTRA_TAB_BEFORE: "unexpectedTabBefore",
  EXTRA_TAB_BEFORE_SELF_CLOSE: "unexpectedTabBeforeSelfClose",
  EXTRA_TAB_BETWEEN: "unexpectedTabBetween",
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Disallow extra spacing inside tags",
      category: RULE_CATEGORY.STYLE,
      recommended: true,
      url: getRuleUrl("no-extra-spacing-tags"),
    } as Rule.RuleMetaData["docs"],

    fixable: true as unknown as "code",
    schema: [
      {
        type: "object",
        properties: {
          disallowInAssignment: {
            type: "boolean",
          },
          disallowMissing: {
            type: "boolean",
          },
          disallowTabs: {
            type: "boolean",
          },
          enforceBeforeSelfClose: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.EXTRA_BETWEEN]: "Unexpected space between attributes",
      [MESSAGE_IDS.EXTRA_AFTER]: "Unexpected space after attribute",
      [MESSAGE_IDS.EXTRA_BEFORE]: "Unexpected space before attribute",
      [MESSAGE_IDS.EXTRA_BEFORE_CLOSE]: "Unexpected space before closing",
      [MESSAGE_IDS.EXTRA_IN_ASSIGNMENT]: "Unexpected space in attribute assignment",
      [MESSAGE_IDS.MISSING_BEFORE_SELF_CLOSE]: "Missing space before self closing",
      [MESSAGE_IDS.EXTRA_BEFORE_SELF_CLOSE]: "Unexpected extra spaces before self closing",
      [MESSAGE_IDS.MISSING_BEFORE]: "Missing space before attribute",
      [MESSAGE_IDS.EXTRA_TAB_BEFORE]: "Unexpected tab before attribute; use space instead",
      [MESSAGE_IDS.EXTRA_TAB_BEFORE_SELF_CLOSE]: "Unexpected tab before self closing; use space instead",
      [MESSAGE_IDS.EXTRA_TAB_BETWEEN]: "Unexpected tab between attributes; use space instead",
    },
  },
  create(context) {
    const enforceBeforeSelfClose = !!(context.options[0] || {})
      .enforceBeforeSelfClose;
    const disallowMissing = !!(context.options[0] || {}).disallowMissing;
    const disallowTabs = !!(context.options[0] || {}).disallowTabs;
    const disallowInAssignment = !!(context.options[0] || ([] as Option))
      .disallowInAssignment;

    const sourceCode = getSourceCode(context).text;

    function checkExtraSpacesBetweenAttrs(attrs: Attribute[]) {
      attrs.forEach((current, index, attrs) => {
        if (index >= attrs.length - 1) {
          return;
        }
        const after = attrs[index + 1]!;
        if (current.loc.end.line !== after.loc.start.line) {
          // skip the attributes on the other line
          return;
        }
        const spacesBetween = after.loc.start.column - current.loc.end.column;
        if (spacesBetween > 1) {
          context.report({
            loc: getLocBetween(current, after),
            messageId: MESSAGE_IDS.EXTRA_BETWEEN,
            fix(fixer) {
              return fixer.replaceTextRange(
                [current.range[1], after.range[0]],
                ` `,
              );
            },
          });
        } else if (disallowMissing && spacesBetween < 1) {
          context.report({
            loc: after.loc,
            messageId: MESSAGE_IDS.MISSING_BEFORE,
            fix(fixer) {
              return fixer.insertTextAfter(current, " ");
            },
          });
        } else if (disallowTabs) {
          if (sourceCode[current.range[1]] === `\t`) {
            context.report({
              loc: getLocBetween(current, after),
              messageId: MESSAGE_IDS.EXTRA_TAB_BETWEEN,
              fix(fixer) {
                return fixer.replaceTextRange(
                  [current.range[1], after.range[0]],
                  ` `,
                );
              },
            });
          }
        }
      });
    }

    function checkExtraSpaceBefore(
      node: OpenScriptTagStart | OpenTagStart | OpenStyleTagStart,
      firstAttr: Attribute,
    ) {
      if (node.loc.start.line !== firstAttr.loc.start.line) {
        // skip the attribute on the different line with the start tag
        return;
      }

      const spacesBetween = firstAttr.loc.start.column - node.loc.end.column;
      if (spacesBetween >= 2) {
        context.report({
          loc: getLocBetween(node, firstAttr),

          messageId: MESSAGE_IDS.EXTRA_BEFORE,
          fix(fixer) {
            return fixer.removeRange([
              firstAttr.range[0] - spacesBetween + 1,
              firstAttr.range[0],
            ]);
          },
        });
      } else if (disallowTabs) {
        if (sourceCode[firstAttr.range[0] - 1] === `\t`) {
          context.report({
            loc: firstAttr.loc,
            messageId: MESSAGE_IDS.EXTRA_TAB_BEFORE,
            fix(fixer) {
              return fixer.replaceTextRange(
                [firstAttr.range[0] - 1, firstAttr.range[0]],
                ` `,
              );
            },
          });
        }
      }
    }

    function check(node: Tag | StyleTag | ScriptTag) {
      if (!node.attributes) {
        return;
      }

      if (node.attributes.length) {
        checkExtraSpaceBefore(node.openStart, node.attributes[0]!);

        for (const attr of node.attributes) {
          if (attr.startWrapper && attr.value) {
            if (
              disallowInAssignment
              && attr.startWrapper.loc.start.column - attr.key.loc.end.column
                > 1
            ) {
              const start = attr.key.range[1];
              const end = attr.startWrapper.range[0];
              context.report({
                node: attr,
                messageId: MESSAGE_IDS.EXTRA_IN_ASSIGNMENT,
                fix(fixer) {
                  return fixer.replaceTextRange([start, end], `=`);
                },
              });
            }
          }
        }
      }

      if (node.openEnd) {
        checkExtraSpacesBetweenAttrs(node.attributes);

        const lastAttr = node.attributes[node.attributes.length - 1]!;
        const nodeBeforeEnd = node.attributes.length === 0
          ? node.openStart
          : lastAttr;

        if (nodeBeforeEnd.loc.end.line !== node.openEnd.loc.start.line) {
          return;
        }

        const isSelfClosing = node.openEnd.value === "/>";

        const spacesBetween = node.openEnd.loc.start.column
          - nodeBeforeEnd.loc.end.column;
        const locBetween = getLocBetween(nodeBeforeEnd, node.openEnd);

        if (isSelfClosing && enforceBeforeSelfClose) {
          if (spacesBetween < 1) {
            context.report({
              loc: locBetween,
              messageId: MESSAGE_IDS.MISSING_BEFORE_SELF_CLOSE,
              fix(fixer) {
                return fixer.insertTextAfter(nodeBeforeEnd, " ");
              },
            });
          } else if (spacesBetween === 1) {
            if (
              disallowTabs
              && sourceCode[node.openEnd.range[0] - 1] === `\t`
            ) {
              context.report({
                loc: node.openEnd.loc,
                messageId: MESSAGE_IDS.EXTRA_TAB_BEFORE_SELF_CLOSE,
                fix(fixer) {
                  return fixer.replaceTextRange(
                    [node.openEnd.range[0] - 1, node.openEnd.range[0]],
                    ` `,
                  );
                },
              });
            }
          } else {
            context.report({
              loc: locBetween,
              messageId: MESSAGE_IDS.EXTRA_BEFORE_SELF_CLOSE,
              fix(fixer) {
                return fixer.removeRange([
                  nodeBeforeEnd.range[1] + 1,
                  node.openEnd.range[0],
                ]);
              },
            });
          }

          return;
        }

        if (spacesBetween > 0) {
          if (node.attributes.length > 0) {
            context.report({
              loc: locBetween,
              messageId: MESSAGE_IDS.EXTRA_AFTER,
              fix(fixer) {
                return fixer.removeRange([
                  lastAttr.range[1],
                  node.openEnd.range[0],
                ]);
              },
            });
          } else {
            context.report({
              loc: locBetween,
              messageId: MESSAGE_IDS.EXTRA_BEFORE_CLOSE,
              fix(fixer) {
                return fixer.removeRange([
                  node.openStart.range[1],
                  node.openEnd.range[0],
                ]);
              },
            });
          }
        }
      }
    }

    return createVisitors(context, {
      Tag: check,
      StyleTag: check,
      ScriptTag: check,
    });
  },
};

export default rule;
