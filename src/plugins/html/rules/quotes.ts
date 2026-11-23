// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/quotes.js.
import { NODE_TYPES } from "@html-eslint/parser";
import type {
  Attribute,
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import type { AST } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getRuleUrl } from "../utils/rule.js";
import { getSourceCode } from "../utils/source-code.js";
import { createVisitors } from "../utils/visitors.js";

type SingleOrQuoteOption = "single" | "double";

type ObjectOption = { enforceTemplatedAttrValue: boolean };

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
  MISSING: "missing",
};

const QUOTES_STYLES = {
  SINGLE: "single",
  DOUBLE: "double",
};

const QUOTES_CODES = [`"`, `'`];

const rule: RuleModule<[SingleOrQuoteOption, ObjectOption]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce consistent quoting attributes with double(\") or single(')",
      category: RULE_CATEGORY.STYLE,
      recommended: true,
      url: getRuleUrl("quotes"),
    } as RuleModule<[]>["meta"]["docs"],
    fixable: true as unknown as "code",
    schema: [
      {
        enum: [QUOTES_STYLES.SINGLE, QUOTES_STYLES.DOUBLE],
      },
      {
        type: "object",
        properties: {
          enforceTemplatedAttrValue: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "Expected {{expected}} quotes but found {{actual}}.",
      [MESSAGE_IDS.MISSING]: "Expected {{expected}} quotes but no quotes found.",
    },
  },

  create(context) {
    const SELECTED_STYLE = context.options?.[0] ?? QUOTES_STYLES.DOUBLE;
    const expectedQuote = SELECTED_STYLE === QUOTES_STYLES.DOUBLE ? `"` : `'`;
    const enforceTemplatedAttrValue = context
      .options
      ?.[1]
      ?.enforceTemplatedAttrValue;

    const sourceCode = getSourceCode(context);

    function getCodeIn(range: AST.Range): string {
      return sourceCode.text.slice(range[0], range[1]);
    }

    function getQuotes(attr: Attribute): [string, string] {
      return [attr.startWrapper!.value, attr.endWrapper!.value];
    }

    function checkQuotes(attr: Attribute): void {
      if (!attr.value || attr.value.value.includes(expectedQuote)) {
        return;
      }
      /** Allow template expression. ex: html`<div foo=${foo}></div>` */
      if (
        !enforceTemplatedAttrValue
        && attr.value.parts.some((part) => part.type === NODE_TYPES.Template)
      ) {
        return;
      }

      if (attr.startWrapper && attr.endWrapper) {
        const [opening, closing] = getQuotes(attr);
        if (QUOTES_CODES.includes(opening)) {
          if (opening === closing && opening !== expectedQuote) {
            context.report({
              node: attr,
              messageId: MESSAGE_IDS.UNEXPECTED,
              data: {
                expected: `${SELECTED_STYLE}(${expectedQuote})`,
                actual: SELECTED_STYLE === QUOTES_STYLES.SINGLE
                  ? `${QUOTES_STYLES.DOUBLE}(")`
                  : `${QUOTES_STYLES.SINGLE}(')`,
              },
              fix(fixer) {
                if (
                  !attr.startWrapper
                  || !attr.endWrapper
                  || attr.value === undefined
                ) {
                  return null;
                }
                return fixer.replaceTextRange(
                  [attr.startWrapper.range[0], attr.endWrapper.range[1]],
                  `${expectedQuote}${attr.value.value}${expectedQuote}`,
                );
              },
            });
          }
        }
      } else {
        context.report({
          node: attr,
          messageId: MESSAGE_IDS.MISSING,
          data: {
            expected: `${SELECTED_STYLE}(${expectedQuote})`,
          },
          fix(fixer) {
            if (attr.value === undefined) { return null; }
            const originCode = getCodeIn(attr.value.range);
            return fixer.replaceTextRange(
              attr.value.range,
              `${expectedQuote}${originCode}${expectedQuote}`,
            );
          },
        });
      }
    }
    function check(node: Tag | ScriptTag | StyleTag) {
      node.attributes.forEach((attr) => checkQuotes(attr));
    }

    return createVisitors(context, {
      Tag: check,
      ScriptTag: check,
      StyleTag: check,
    });
  },
};

export default rule;
