// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/languages/html-source-code.test.js.
import type { File } from "@eslint/core";
import { describe, expect, it } from "vitest";
import { HTMLLanguage } from "../../../../../src/plugins/html/language/html-language.js";
import { createHTMLSourceCode } from "../../../../../src/plugins/html/language/html-source-code.js";

const createFile = (text: string): File => {
  return {
    body: text,
    path: "test.html",
    physicalPath: "test.html",
    bom: false,
  };
};

const createSourceCode = (text: string) => {
  const language = new HTMLLanguage();
  const file = createFile(text);
  const parsed = language.parse(file, { languageOptions: {} });
  const sourceCode = createHTMLSourceCode({
    text,
    // @ts-ignore
    ast: parsed.ast,
    // @ts-ignore
    comments: parsed.comments,
  });

  return sourceCode;
};

describe("HTMLSourceCode", () => {
  const code = `<!-- eslint-disable -->
<!-- eslint-disable @html-eslint/no-duplicate-attrs -->
<!-- eslint-disable-next-line -->
<!-- eslint-disable-line -->
<!-- eslint-enable -->
`;
  describe("getInlineConfigNodes()", () => {
    it("should return inline config nodes", () => {
      const sourceCode = createSourceCode(code);
      expect(sourceCode.getInlineConfigNodes().length).toBe(5);
    });
  });

  describe("getDisableDirectives", () => {
    it("should return directives", () => {
      const sourceCode = createSourceCode(code);

      expect(sourceCode.getDisableDirectives().directives.length).toBe(5);
      expect(sourceCode.getDisableDirectives().problems.length).toBe(0);
    });

    it("should return problems", () => {
      const code = `<!--
 eslint-disable-line
-->
        `;
      const sourceCode = createSourceCode(code);

      expect(sourceCode.getDisableDirectives().problems.length).toBe(1);
    });
  });

  describe("getParent()", () => {
    it("should return the parent", () => {
      const code = `<div><span></span></div>`;
      const sourceCode = createSourceCode(code);
      // @ts-ignore
      const span = sourceCode.ast.body[0].children[0].children[0];
      sourceCode.traverse();
      // @ts-ignore
      expect(sourceCode.getParent(span).type).toBe("Tag");
      // @ts-ignore
      expect(sourceCode.getParent(span).name).toBe("div");
    });
  });
});
