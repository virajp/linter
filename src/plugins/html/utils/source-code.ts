// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/utils/source-code.js.
import type { Context } from "../types/index.js";

export function getSourceCode(context: Context<any[]>) {
  return (
    context.sourceCode
    || (context as Context<any[]> & {
      getSourceCode(): Context<any>["sourceCode"];
    })
      .getSourceCode()
  );
}
