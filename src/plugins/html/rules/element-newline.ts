// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/element-newline.js.
import type {
  AnyNode,
  CloseTag,
  OpenTagEnd,
  Text,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type {
  Line,
  RuleModule,
} from "../types/index.js";
import {
  getNameOf,
  isComment,
  isLine,
  isScript,
  isStyle,
  isTag,
  isText,
  splitToLineNodes,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

type AnyNodeOrLine = AnyNode | Line;

type Option = {
  skip?: string[];
  inline?: string[];
};

const MESSAGE_IDS = {
  EXPECT_NEW_LINE_AFTER: "expectAfter",
};

const PRESETS: { [key: string]: string[] } = {
  // From https://developer.mozilla.org/en-US/docs/Web/HTML/Element#inline_text_semantics
  $inline: `
a
abbr
b
bdi
bdo
br
cite
code
data
dfn
em
i
kbd
mark
q
rp
rt
ruby
s
samp
small
span
strong
sub
sup
time
u
var
wbr
  `
    .trim()
    .split(`\n`),
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce newline between elements.",
      category: RULE_CATEGORY.STYLE,
      recommended: true,
      url: getRuleUrl("element-newline"),
    } as Rule.RuleMetaData["docs"],

    fixable: true as unknown as "code",
    schema: [
      {
        type: "object",
        properties: {
          inline: {
            type: "array",
            items: {
              type: "string",
            },
          },

          skip: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.EXPECT_NEW_LINE_AFTER]: "There should be a linebreak after {{name}}.",
    },
  },

  create(context) {
    const option = context.options[0] || {};
    const skipTags: string[] = option.skip || ["pre", "code"];
    const inlineTags = optionsOrPresets(option.inline || []);

    function getChildrenToCheck(
      children: AnyNodeOrLine[],
    ): Exclude<AnyNodeOrLine, Text>[] {
      const childrenToCheck: Exclude<AnyNodeOrLine, Text>[] = [];

      for (const child of children) {
        if (isText(child)) {
          const lines = splitToLineNodes(child);
          childrenToCheck.push(...lines);
          continue;
        }
        childrenToCheck.push(child);
      }
      return childrenToCheck.filter((child) => !isEmptyText(child));
    }

    function isOnTheSameLine(
      before: AnyNodeOrLine,
      after: AnyNodeOrLine,
    ): boolean {
      return before.loc.end.line === after.loc.start.line;
    }

    function shouldSkipChildren(node: AnyNode): boolean {
      if (isTag(node)) {
        if (skipTags.includes(getNameOf(node))) {
          return true;
        }
        if (node.children.some((child) => child.type === "RawContent")) {
          return true;
        }
      }
      return false;
    }

    function isInline(node: AnyNodeOrLine): boolean {
      return (
        isLine(node) || (isTag(node) && inlineTags.includes(getNameOf(node)))
      );
    }

    function checkChildren(
      children: AnyNode[],
      parent: AnyNode,
      wrapper?: [OpenTagEnd, CloseTag],
    ) {
      if (shouldSkipChildren(parent)) {
        return;
      }

      const childrenToCheck = getChildrenToCheck(children);
      const firstChild = childrenToCheck[0];
      if (
        wrapper
        && firstChild
        && childrenToCheck.some((child) => !isInline(child))
      ) {
        const open = wrapper[0];
        if (isOnTheSameLine(open, firstChild)) {
          context.report({
            node: open,
            messageId: MESSAGE_IDS.EXPECT_NEW_LINE_AFTER,
            data: { name: getName(parent) },
            fix(fixer) {
              return fixer.insertTextAfter(open, `\n`);
            },
          });
        }
      }

      childrenToCheck.forEach((current, index) => {
        const next = childrenToCheck[index + 1];

        if (
          !next
          || !isOnTheSameLine(current, next)
          || (isInline(current) && isInline(next))
        ) {
          return;
        }

        context.report({
          node: current,
          messageId: MESSAGE_IDS.EXPECT_NEW_LINE_AFTER,
          data: { name: getName(current, { isClose: true }) },
          fix(fixer) {
            return fixer.insertTextAfter(current, `\n`);
          },
        });
      });

      childrenToCheck.forEach((child) => {
        if (isTag(child)) {
          const wrapper: [OpenTagEnd, CloseTag] | undefined = child.close
            ? [child.openEnd, child.close]
            : undefined;
          checkChildren(child.children, child, wrapper);
        }
      });

      const lastChild = childrenToCheck[childrenToCheck.length - 1];
      if (
        wrapper
        && lastChild
        && childrenToCheck.some((child) => !isInline(child))
      ) {
        const close = wrapper[1];
        if (isOnTheSameLine(close, lastChild)) {
          context.report({
            node: lastChild,
            messageId: MESSAGE_IDS.EXPECT_NEW_LINE_AFTER,
            data: { name: getName(lastChild, { isClose: true }) },
            fix(fixer) {
              return fixer.insertTextAfter(lastChild, `\n`);
            },
          });
        }
      }
    }

    function isEmptyText(node: AnyNodeOrLine): boolean {
      return (
        (isText(node) && node.value.trim().length === 0)
        || (isLine(node) && node.value.trim().length === 0)
      );
    }

    function getName(
      node: AnyNodeOrLine,
      options: { isClose?: boolean } = {},
    ) {
      const isClose = options.isClose || false;
      if (isTag(node)) {
        if (isClose) {
          return `</${node.name}>`;
        }
        return `<${node.name}>`;
      }
      if (isLine(node)) {
        return "text";
      }
      if (isComment(node)) {
        return "comment";
      }
      if (isScript(node)) {
        if (isClose) {
          return `</script>`;
        }
        return "<script>";
      }
      if (isStyle(node)) {
        if (isClose) {
          return `</style>`;
        }
        return "<style>";
      }
      return `<${node.type}>`;
    }

    function optionsOrPresets(options: string[]) {
      const result = [];
      for (const option of options) {
        if (option in PRESETS) {
          const preset = PRESETS[option]!;
          result.push(...preset);
        } else {
          result.push(option);
        }
      }
      return result;
    }

    return createVisitors(context, {
      Document(node) {
        checkChildren(node.children, node);
      },
    });
  },
};

export default rule;
