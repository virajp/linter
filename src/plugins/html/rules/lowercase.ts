// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/lowercase.js.
import type {
  Doctype,
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import SVG_CAMEL_CASE_ATTRIBUTES from "../constants/svg-camel-case-attributes.js";
import type { RuleModule } from "../types/index.js";
import {
  getNameOf,
  hasTemplate,
} from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

const MESSAGE_IDS = {
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[]> = {
  meta: {
    type: "suggestion",

    docs: {
      description: "Enforce use of lowercase for tag and attribute names.",
      category: RULE_CATEGORY.STYLE,
      recommended: false,
      url: getRuleUrl("lowercase"),
    } as Rule.RuleMetaData["docs"],

    fixable: "code",
    schema: [],
    messages: {
      [MESSAGE_IDS.UNEXPECTED]: "'{{name}}' is not in lowercase.",
    },
  },

  create(context) {
    const allowedAttrKeySet = new Set(SVG_CAMEL_CASE_ATTRIBUTES);
    const svgStack: Tag[] = [];

    function enterSvg(node: Tag) {
      svgStack.push(node);
    }

    function exitSvg() {
      svgStack.pop();
    }

    function isAllowedAttributeKey(key: string): boolean {
      return !!svgStack.length && allowedAttrKeySet.has(key);
    }

    function check(node: Tag | StyleTag | ScriptTag) {
      const raw = node.openStart.value.slice(1);
      const name = getNameOf(node);
      if (
        name !== raw
        && (svgStack.length === 0 || name.toLowerCase() === "svg")
      ) {
        context.report({
          node: node.openStart,
          messageId: MESSAGE_IDS.UNEXPECTED,
          data: {
            name: raw,
          },
          fix(fixer) {
            const fixes = [
              fixer.replaceTextRange(node.openStart.range, `<${name}`),
            ];

            if (node.close) {
              fixes.push(
                fixer.replaceTextRange(node.close.range, `</${name}>`),
              );
            }

            return fixes;
          },
        });
      }
      if (node.attributes?.length) {
        node.attributes.forEach((attribute) => {
          if (isAllowedAttributeKey(attribute.key.value)) {
            return;
          }
          if (hasTemplate(attribute.key)) {
            return;
          }
          if (attribute.key.value !== attribute.key.value.toLowerCase()) {
            context.report({
              node: attribute.key,
              messageId: MESSAGE_IDS.UNEXPECTED,
              data: {
                name: attribute.key.value,
              },
              fix(fixer) {
                return fixer.replaceText(
                  attribute.key,
                  attribute.key.value.toLowerCase(),
                );
              },
            });
          }
        });
      }
    }

    function checkDoctype(doctype: Doctype) {
      const openValue = doctype.open.value;
      if (
        openValue !== openValue.toLowerCase()
        && openValue !== openValue.toUpperCase()
      ) {
        context.report({
          node: doctype.open,
          messageId: MESSAGE_IDS.UNEXPECTED,
          data: {
            name: openValue.slice(1),
          },
          fix(fixer) {
            return fixer.replaceTextRange(doctype.open.range, "<!doctype");
          },
        });
      }
      if (doctype.attributes?.length) {
        doctype.attributes.forEach((attribute) => {
          if (
            attribute.value
            && attribute.value.value !== attribute.value.value.toLowerCase()
          ) {
            context.report({
              node: attribute.value,
              messageId: MESSAGE_IDS.UNEXPECTED,
              data: {
                name: attribute.value.value,
              },
              fix(fixer) {
                return fixer.replaceText(
                  attribute.value!,
                  attribute.value!.value.toLowerCase(),
                );
              },
            });
          }
        });
      }
    }

    return createVisitors(context, {
      "Tag"(node) {
        if (node.name.toLocaleLowerCase() === "svg") {
          enterSvg(node);
        }
        check(node);
      },
      "Tag:exit"(node) {
        if (node.name.toLocaleLowerCase() === "svg") {
          exitSvg();
        }
      },
      "StyleTag": check,
      "ScriptTag": check,
      "Doctype": checkDoctype,
    });
  },
};

export default rule;
