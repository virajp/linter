// Ported from eslint-plugin-astro v3.2.1 (MIT), src/rules/missing-client-only-directive-value.ts.
import type { AST } from "astro-eslint-parser";
import type { RuleModule } from "../types.js";
import {
  getAttributeName,
  getStaticAttributeValue,
} from "../utils/ast-utils.js";
import { createRule } from "../utils/index.js";

export default createRule("missing-client-only-directive-value", {
  meta: {
    docs: {
      description: "the client:only directive is missing the correct component's framework value",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [],
    messages: {
      missingValue: "`client:only` directive is missing a value",
    },
    type: "problem",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices?.isAstro) {
      return {};
    }

    /** VerifyDirectiveValue */
    function verifyDirectiveValue(
      attr: AST.JSXAttribute | AST.AstroTemplateLiteralAttribute,
    ) {
      const directiveName = getAttributeName(attr);
      if (directiveName !== "client:only") { return; }

      const directiveValue = getStaticAttributeValue(attr, context);
      if (directiveValue !== null) { return; }

      context.report({
        node: attr.name,
        messageId: "missingValue",
      });
    }

    return {
      JSXAttribute: verifyDirectiveValue,
      AstroTemplateLiteralAttribute: verifyDirectiveValue,
    };
  },
}) as RuleModule;
