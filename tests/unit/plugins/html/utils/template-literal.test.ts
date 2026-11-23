// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/utils/template-literal.test.js.
import { SourceCode } from "eslint";
import { parse } from "espree";
import { describe, expect, it, vi } from "vitest";
import { parseTemplateLiteral } from "../../../../../src/plugins/html/utils/template-literal.js";

const parseCode = (code: string) => {
  const parsed = parse(code, {
    range: true,
    loc: true,
    ecmaVersion: "latest",
  });
  const sourceCode = new SourceCode({
    text: code,
    ast: {
      ...parsed,
      tokens: [],
      comments: [],
      // @ts-ignore
      loc: parsed.loc,
      // @ts-ignore
      range: parsed.range,
    },
  });
  return { parsed, sourceCode };
};

describe("parseTemplateLiteral", () => {
  it("should cache result", () => {
    const { parsed, sourceCode } = parseCode(`html\`<div></div>\`;`);
    // @ts-ignore
    const node = parsed.body[0].expression.quasi;
    const ast = parseTemplateLiteral(node, sourceCode);
    const cachedAst = parseTemplateLiteral(node, sourceCode);
    expect(ast).toBe(cachedAst);
  });

  it("should run visitor", () => {
    const { parsed, sourceCode } = parseCode(`html\`<div></div>\`;`);
    // @ts-ignore
    const node = parsed.body[0].expression.quasi;
    const visitor = {
      OpenTagStart: vi.fn(),
    };
    parseTemplateLiteral(node, sourceCode, visitor);
    expect(visitor.OpenTagStart).toHaveBeenCalledTimes(1);
    parseTemplateLiteral(node, sourceCode, visitor);
    expect(visitor.OpenTagStart).toHaveBeenCalledTimes(2);
  });
});
