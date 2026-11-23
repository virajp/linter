// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/utils/template-literal.js.
import {
  parse,
  traverse,
} from "@html-eslint/template-parser";
import type { TemplateHTMLVisitor } from "@html-eslint/template-parser";
import type { TemplateLiteral } from "@html-eslint/types";
import type {
  AnyToken,
  DocumentNode,
} from "es-html-parser";
import type { SourceCode } from "eslint";

/**
 * Cache for parsed template literals to avoid re-parsing the same template
 * multiple times. Uses WeakMap for automatic garbage collection when nodes are
 * no longer referenced.
 */
const templateCache: WeakMap<
  TemplateLiteral,
  { ast: any; html: string; tokens: any[] }
> = new WeakMap();

/**
 * Get or create cached parse result for a template literal.
 */
export function parseTemplateLiteral(
  node: TemplateLiteral,
  sourceCode: SourceCode,
  visitor?: TemplateHTMLVisitor,
): { ast: DocumentNode; html: string; tokens: AnyToken[] } {
  // Check if we already have a cached result for this node
  const cachedResult = templateCache.get(node);
  if (cachedResult) {
    if (visitor) {
      traverse(cachedResult.ast, visitor);
    }
    return cachedResult;
  }

  // Parse and cache the result
  const result = parse(node, sourceCode);
  templateCache.set(node, result);
  if (visitor) {
    traverse(result.ast, visitor);
  }
  return result;
}
