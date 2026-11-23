// Ported from eslint-plugin-astro v3.2.1 (MIT), src/rules/no-deprecated-astro-resolve.ts.
import {
  READ,
  ReferenceTracker,
} from "@eslint-community/eslint-utils";
import type { RuleModule } from "../types.js";
import { createRule } from "../utils/index.js";

export default createRule("no-deprecated-astro-resolve", {
  meta: {
    docs: {
      description: "disallow using deprecated `Astro.resolve()`",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [],
    messages: {
      deprecated: "'Astro.resolve()' is deprecated.",
    },
    type: "problem",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isAstro) {
      return {};
    }

    return {
      "Program:exit"(node) {
        const tracker = new ReferenceTracker(sourceCode.getScope(node));
        for (
          const { node, path } of tracker.iterateGlobalReferences({
            Astro: {
              resolve: { [READ]: true },
            },
          })
        ) {
          context.report({
            node,
            messageId: "deprecated",
            data: { name: path.join(".") },
          });
        }
      },
    };
  },
}) as RuleModule;
