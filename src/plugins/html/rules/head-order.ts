// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/head-order.js.
import { NODE_TYPES } from "@html-eslint/parser";
import {
  analyzeHeadWithOrdering,
  getWeight,
} from "@rviscomi/capo.js";
import type { Rule } from "eslint";
import { RULE_CATEGORY } from "../constants/index.js";
import type { RuleModule } from "../types/index.js";
import { HtmlEslintAdapter } from "../utils/capo-adapter.js";
import { getRuleUrl } from "../utils/rule.js";
import {
  shouldCheckTaggedTemplateExpression,
  shouldCheckTemplateLiteral,
} from "../utils/settings.js";
import { getSourceCode } from "../utils/source-code.js";
import { parseTemplateLiteral } from "../utils/template-literal.js";

type CapoAdapter = Parameters<typeof getWeight>[1];

const MESSAGE_IDS = {
  WRONG_ORDER: "wrongOrder",
};

type IgnorePattern = {
  /** Regex pattern for tag (e.g., "script", "link") */
  tagPattern?: string;
  /** Regex pattern for attribute key (e.g., "rel", "src") */
  attrKeyPattern?: string;
  /** Regex pattern for attribute value */
  attrValuePattern?: string;
};

type RuleOptions = {
  /** Array of ignore pattern objects */
  ignores?: IgnorePattern[];
};

const rule: RuleModule<[RuleOptions?]> = {
  meta: {
    type: "code" as "problem",

    docs: {
      description: "Enforce optimal ordering of elements in `<head>`",
      category: RULE_CATEGORY.BEST_PRACTICE,
      recommended: false,
      url: getRuleUrl("head-order"),
    } as Rule.RuleMetaData["docs"],

    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          ignores: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tagPattern: {
                  type: "string",
                },
                attrKeyPattern: {
                  type: "string",
                },
                attrValuePattern: {
                  type: "string",
                },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      [MESSAGE_IDS.WRONG_ORDER]:
        "{{nextCategory}} element should come before {{currentCategory}} element for optimal performance",
    },
  },

  create(context) {
    const adapter = new HtmlEslintAdapter();
    const sourceCode = getSourceCode(context);
    const options: RuleOptions = context.options[0] || {};
    const ignorePatterns = (options.ignores || []).map((pattern) => ({
      tagRegex: pattern.tagPattern ? new RegExp(pattern.tagPattern, "u") : null,
      attrKeyRegex: pattern.attrKeyPattern
        ? new RegExp(pattern.attrKeyPattern, "u")
        : null,
      attrValueRegex: pattern.attrValuePattern
        ? new RegExp(pattern.attrValuePattern, "u")
        : null,
    }));

    /**
     * Check if a tag should be ignored based on ignore patterns or if it's a
     * comment
     *
     * @param element - Element node to check
     * @returns - True if the element should be ignored
     */
    function shouldIgnoreElement(element: any): boolean {
      // Ignore HTML comments
      if (element.type === NODE_TYPES.Comment) {
        return true;
      }

      return ignorePatterns.some(
        ({ tagRegex, attrKeyRegex, attrValueRegex }) => {
          const checks: boolean[] = [];

          if (tagRegex) {
            const tagName = adapter.getTagName(element);
            checks.push(tagRegex.test(tagName));
          }

          if (attrKeyRegex) {
            const attrNames = adapter.getAttributeNames(element);
            checks.push(attrNames.some((name) => attrKeyRegex.test(name)));
          }

          if (attrValueRegex) {
            const attrNames = adapter.getAttributeNames(element);
            const hasMatchingValue = attrNames.some((name) => {
              const value = adapter.getAttribute(element, name);
              return value !== null && attrValueRegex.test(value);
            });
            checks.push(hasMatchingValue);
          }

          // All specified patterns must match (AND condition)
          return checks.length > 0 && checks.every((check) => check === true);
        },
      );
    }

    /**
     * Process a head tag node and report violations
     *
     * @param node - Head tag node to process
     */
    function processHeadTag(node: any) {
      if (node.name !== "head") {
        return;
      }
      const analysis = analyzeHeadWithOrdering(
        node,
        adapter as unknown as CapoAdapter,
      );

      if (analysis.orderingViolations.length === 0) {
        return;
      }

      const children = adapter.getChildren(node);

      // Filter violations to exclude ignored elements
      const filteredViolations = analysis.orderingViolations.filter(
        (violation) =>
          !shouldIgnoreElement(violation.nextElement)
          && !shouldIgnoreElement(violation.currentElement),
      );

      for (const violation of filteredViolations) {
        context.report({
          node: violation.nextElement,
          messageId: MESSAGE_IDS.WRONG_ORDER,
          data: {
            nextCategory: violation.nextCategory,
            currentCategory: violation.currentCategory,
          },
          fix(fixer) {
            // Separate children into ignored and non-ignored
            const childrenWithIgnoreFlag = children.map((child) => ({
              element: child,
              ignored: shouldIgnoreElement(child),
              originalIndex: children.indexOf(child),
            }));

            // Get non-ignored children and sort them
            const nonIgnoredChildren = childrenWithIgnoreFlag
              .filter((item) => !item.ignored)
              .map((item) => item.element);

            const sortedNonIgnored = [...nonIgnoredChildren].sort((a, b) => {
              const weightA = getWeight(a, adapter as unknown as CapoAdapter);
              const weightB = getWeight(b, adapter as unknown as CapoAdapter);
              return weightB - weightA;
            });

            const fixes = [];

            // Only replace non-ignored children
            let sortedIndex = 0;
            for (let i = 0; i < children.length; i++) {
              const originalChild = children[i]!;

              if (!shouldIgnoreElement(originalChild)) {
                const sortedChild = sortedNonIgnored[sortedIndex];
                sortedIndex++;

                if (originalChild !== sortedChild) {
                  const sortedText = sourceCode.getText(sortedChild as any);
                  fixes.push(fixer.replaceText(originalChild, sortedText));
                }
              }
            }

            return fixes;
          },
        });
      }
    }

    return {
      Tag(node) {
        processHeadTag(node);
      },

      TaggedTemplateExpression(node) {
        if (shouldCheckTaggedTemplateExpression(node, context)) {
          const visitor = {
            Tag: processHeadTag,
          };
          parseTemplateLiteral(node.quasi, sourceCode, visitor);
        }
      },

      TemplateLiteral(node) {
        if (shouldCheckTemplateLiteral(node, context)) {
          const visitor = {
            Tag: processHeadTag,
          };
          parseTemplateLiteral(node, sourceCode, visitor);
        }
      },
    };
  },
};

export default rule;
