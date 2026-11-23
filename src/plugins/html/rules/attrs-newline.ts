// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/attrs-newline.js.
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type {
  RuleFixer,
  RuleModule,
} from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { getSourceCode } from "../utils/source-code.js";
import { createVisitors } from "../utils/visitors.js";

type MessageId = {
  CLOSE_STYLE_WRONG: "closeStyleWrong";
  NEWLINE_MISSING: "newlineMissing";
};

type Option = {
  closeStyle?: "sameline" | "newline";
  ifAttrsMoreThan?: number;
  maxLen?: number;
  skip?: string[];
  inline?: string[];
};

const MESSAGE_ID: MessageId = {
  CLOSE_STYLE_WRONG: "closeStyleWrong",
  NEWLINE_MISSING: "newlineMissing",
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

/**
 * Expand preset tokens (e.g. "$inline") into the corresponding tag list.
 */
function optionsOrPresets(options: string[]): string[] {
  const result = [];
  for (const option of options) {
    if (option in PRESETS) {
      result.push(...PRESETS[option]!);
    } else {
      result.push(option);
    }
  }
  return result;
}

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce newline between attributes",
      category: RULE_CATEGORY.STYLE,
      recommended: true,
      url: getRuleUrl("attrs-newline"),
    } as Rule.RuleMetaData["docs"],

    fixable: true as unknown as "code",
    schema: [
      {
        type: "object",
        properties: {
          closeStyle: {
            enum: ["newline", "sameline"],
          },
          ifAttrsMoreThan: {
            type: "integer",
          },
          maxLen: {
            type: "integer",
          },
          skip: {
            type: "array",
            items: {
              type: "string",
            },
          },
          inline: {
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
      [MESSAGE_ID.CLOSE_STYLE_WRONG]: "Closing bracket was on {{actual}}; expected {{expected}}",
      [MESSAGE_ID.NEWLINE_MISSING]: "Newline expected before {{attrName}}",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const attrMin = typeof options.ifAttrsMoreThan !== "number"
      ? 2
      : options.ifAttrsMoreThan;
    const maxLen = typeof options.maxLen === "number"
      ? options.maxLen
      : undefined;
    const closeStyle = options.closeStyle || "newline";
    const skipTags = optionsOrPresets(options.skip || []);
    const inlineTags = optionsOrPresets(options.inline || []);
    const sourceCode = getSourceCode(context);

    /**
     * Tracks nesting depth inside `skip` elements. When > 0, the current node
     * is a descendant of a skipped element.
     */
    let skipDepth = 0;

    return createVisitors(context, {
      "Tag:exit"() {
        if (skipDepth > 0) {
          skipDepth--;
        }
      },

      "Tag"(node) {
        const tagName = node.name.toLowerCase();

        // Inside a skip ancestor — skip this descendant too.
        if (skipDepth > 0) {
          skipDepth++;
          return;
        }

        // This tag is in skip — suppress the rule AND its descendants.
        if (skipTags.includes(tagName)) {
          skipDepth++;
          return;
        }

        // This tag is in inline — suppress only this tag; descendants are still checked.
        if (inlineTags.includes(tagName)) {
          return;
        }

        if (node.attributes.length === 0) { return; }

        const exceedsAttrMin = node.attributes.length > attrMin;
        const exceedsMaxLen = maxLen !== undefined
          && node.attributes.length > 1
          && sourceCode.lines[node.openStart.loc.start.line - 1]!.length
            > maxLen;
        const shouldBeMultiline = exceedsAttrMin || exceedsMaxLen;
        if (!shouldBeMultiline) { return; }

        /**
         * This doesn't do any indentation, so the result will look silly.
         * Indentation should be covered by the `indent` rule
         */
        function fix(fixer: RuleFixer) {
          let expected = node.openStart.value;
          for (const attr of node.attributes) {
            expected += `\n${attr.key.value}`;
            if (attr.value) {
              const startWrapper = attr.startWrapper
                ? attr.startWrapper.value
                : "";
              const endWrapper = attr.endWrapper ? attr.endWrapper.value : "";
              expected += `=${startWrapper}${attr.value.value}${endWrapper}`;
            }
          }

          if (closeStyle === "newline") {
            expected += "\n";
          } else if (node.selfClosing) {
            expected += " ";
          }
          expected += node.openEnd.value;

          return fixer.replaceTextRange(
            [node.openStart.range[0], node.openEnd.range[1]],
            expected,
          );
        }

        let index = 0;
        for (const attr of node.attributes) {
          const attrPrevious = node.attributes[index - 1];
          const relativeToNode = attrPrevious || node.openStart;
          if (attr.loc.start.line === relativeToNode.loc.end.line) {
            return context.report({
              node,
              data: {
                attrName: attr.key.value,
              },
              fix,
              messageId: MESSAGE_ID.NEWLINE_MISSING,
            });
          }
          index += 1;
        }

        const attrLast = node.attributes[node.attributes.length - 1]!;
        const closeStyleActual = node.openEnd.loc.start.line === attrLast.loc.end.line
          ? "sameline"
          : "newline";
        if (closeStyle !== closeStyleActual) {
          return context.report({
            node,
            data: {
              actual: closeStyleActual,
              expected: closeStyle,
            },
            fix,
            messageId: MESSAGE_ID.CLOSE_STYLE_WRONG,
          });
        }
      },
    });
  },
};

export default rule;
