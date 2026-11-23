// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/require-closing-tags.js.
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import {
  RULE_CATEGORY,
  VOID_ELEMENTS,
} from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { getNameOf } from "../utils/node.js";
import { getRuleUrl } from "../utils/rule.js";
import { createVisitors } from "../utils/visitors.js";

type Option = {
  selfClosing?: "always" | "never";
  selfClosingCustomPatterns?: string[];
};

const VOID_ELEMENTS_SET = new Set(VOID_ELEMENTS);

const MESSAGE_IDS = {
  MISSING: "missing",
  MISSING_SELF: "missingSelf",
  UNEXPECTED: "unexpected",
};

const rule: RuleModule<[Option]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Require closing tags.",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: true,
      url: getRuleUrl("require-closing-tags"),
    } as RuleModule<[]>["meta"]["docs"],

    fixable: true as unknown as "code",
    schema: [
      {
        type: "object",
        properties: {
          selfClosing: {
            enum: ["always", "never"],
          },
          selfClosingCustomPatterns: {
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
      [MESSAGE_IDS.MISSING]: "Missing closing tag for {{tag}}.",
      [MESSAGE_IDS.MISSING_SELF]: "Missing self closing tag for {{tag}}",
      [MESSAGE_IDS.UNEXPECTED]: "Unexpected self closing tag for {{tag}}.",
    },
  },

  create(context) {
    const foreignContext: string[] = [];
    const shouldSelfCloseVoid = context.options?.length
      ? context.options[0].selfClosing === "always"
      : false;
    const selfClosingCustomPatternsOption: string[] = context.options?.[0]?.selfClosingCustomPatterns || [];
    const selfClosingCustomPatterns = selfClosingCustomPatternsOption.map(
      (i) => new RegExp(i),
    );

    function checkClosing(node: Tag | ScriptTag | StyleTag) {
      const name = getNameOf(node);
      if (!node.close) {
        context.report({
          node: node,
          data: {
            tag: name,
          },
          messageId: MESSAGE_IDS.MISSING,
        });
      }
    }

    function checkVoidElement(
      node: Tag,
      shouldSelfClose: boolean,
      fixable: boolean,
    ) {
      const hasSelfClose = node.openEnd.value === "/>";
      if (shouldSelfClose && !hasSelfClose) {
        context.report({
          node: node.openEnd,
          data: {
            tag: node.name,
          },
          messageId: MESSAGE_IDS.MISSING_SELF,
          fix(fixer) {
            if (!fixable) {
              return null;
            }
            const fixes = [];
            fixes.push(fixer.replaceText(node.openEnd, " />"));
            if (node.close) { fixes.push(fixer.remove(node.close)); }
            return fixes;
          },
        });
      }
      if (!shouldSelfClose && hasSelfClose) {
        context.report({
          node: node.openEnd,
          data: {
            tag: node.name,
          },
          messageId: MESSAGE_IDS.UNEXPECTED,
          fix(fixer) {
            if (!fixable) {
              return null;
            }
            return fixer.replaceText(node.openEnd, ">");
          },
        });
      }
    }

    return createVisitors(context, {
      "Tag"(node) {
        const isVoidElement = VOID_ELEMENTS_SET.has(node.name);
        const isSelfClosingCustomElement = !!selfClosingCustomPatterns.some(
          (i) => node.name.match(i),
        );
        const isForeign = foreignContext.length > 0;
        const shouldSelfCloseCustom = isSelfClosingCustomElement
          && !node.children.length;
        const shouldSelfCloseForeign = node.selfClosing;
        const shouldSelfClose = (isVoidElement && shouldSelfCloseVoid)
          || (isSelfClosingCustomElement && shouldSelfCloseCustom)
          || (isForeign && shouldSelfCloseForeign);
        const canSelfClose = isVoidElement || isSelfClosingCustomElement || isForeign;
        if (node.selfClosing || canSelfClose) {
          checkVoidElement(node, shouldSelfClose, canSelfClose);
        } else if (node.openEnd.value !== "/>") {
          checkClosing(node);
        }
        if (["svg", "math"].includes(node.name)) { foreignContext.push(node.name); }
      },
      "Tag:exit"(node: Tag) {
        if (node.name === foreignContext[foreignContext.length - 1]) {
          foreignContext.pop();
        }
      },
      "ScriptTag"(node) {
        if (!node.close) {
          checkClosing(node);
        }
      },
      "StyleTag"(node) {
        if (!node.close) {
          checkClosing(node);
        }
      },
    });
  },
};

export default rule;
