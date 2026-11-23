// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/utils/visitors.js.
import type {
  Context,
  RuleListener,
} from "../types/index.js";
import {
  shouldCheckTaggedTemplateExpression,
  shouldCheckTemplateLiteral,
} from "./settings.js";
import { getSourceCode } from "./source-code.js";
import { parseTemplateLiteral } from "./template-literal.js";

function createTemplateVisitors(
  context: Context<any[]>,
  visitors: any,
): RuleListener {
  return {
    TaggedTemplateExpression(node) {
      if (shouldCheckTaggedTemplateExpression(node, context)) {
        parseTemplateLiteral(node.quasi, getSourceCode(context), visitors);
      }
    },
    TemplateLiteral(node) {
      if (shouldCheckTemplateLiteral(node, context)) {
        parseTemplateLiteral(node, getSourceCode(context), visitors);
      }
    },
  };
}

export function createVisitors(
  context: Context<any[]>,
  visitors: RuleListener,
  templateVisitors?: any,
): RuleListener {
  const tmplVisitors = createTemplateVisitors(
    context,
    templateVisitors || visitors,
  );
  return {
    ...visitors,
    ...tmplVisitors,
  };
}
