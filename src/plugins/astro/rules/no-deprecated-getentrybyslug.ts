// Ported from eslint-plugin-astro v3.2.1 (MIT), src/rules/no-deprecated-getentrybyslug.ts.
import type { TSESTree } from "@typescript-eslint/types";
import type { RuleModule } from "../types.js";
import { createRule } from "../utils/index.js";

export default createRule("no-deprecated-getentrybyslug", {
  meta: {
    docs: {
      description: "disallow using deprecated `getEntryBySlug()`",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [],
    messages: {
      deprecated: "'getEntryBySlug()' is deprecated. Use 'getEntry()' instead.",
    },
    type: "problem",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isAstro) {
      return {};
    }

    return {
      ImportSpecifier(node: TSESTree.ImportSpecifier) {
        if (
          node.imported.type === "Identifier"
          && node.imported.name === "getEntryBySlug"
          && node.parent?.type === "ImportDeclaration"
          && node.parent.source.value === "astro:content"
        ) {
          context.report({
            node,
            messageId: "deprecated",
          });
        }
      },
    };
  },
}) as RuleModule;
