// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/languages/html-language.js.
import type {
  File,
  FileError,
  Language,
  OkParseResult,
  ParseResult,
} from "@eslint/core";
import {
  parseForESLint,
  visitorKeys,
} from "@html-eslint/parser";
import type {
  HTMLProgram,
  ParserOptions,
} from "@html-eslint/parser";
import type { CommentContent } from "@html-eslint/types";
import { createHTMLSourceCode } from "./html-source-code.js";

export type HTMLLanguageType = Language<{
  LangOptions: ParserOptions;
  Code: ReturnType<typeof createHTMLSourceCode>;
  RootNode: HTMLProgram;
  Node: {};
}>;

export class HTMLLanguage implements HTMLLanguageType {
  fileType: "text";

  lineStart: 0 | 1;

  columnStart: 0 | 1;

  nodeTypeKey: string;

  /**
   * The visitor keys for the es-html-parser AST.
   */
  visitorKeys: Record<string, string[]>;

  constructor() {
    this.fileType = "text";
    this.lineStart = 1;
    this.columnStart = 0;
    this.nodeTypeKey = "type";
    this.visitorKeys = visitorKeys;
  }

  validateLanguageOptions(languageOptions: ParserOptions) {
    if (!languageOptions) {
      return;
    }
    if (
      "frontmatter" in languageOptions
      && typeof languageOptions.frontmatter !== "boolean"
    ) {
      throw new TypeError("Expected a boolean value for 'frontmatter' option.");
    }
    if (
      "templateEngineSyntax" in languageOptions
      && (typeof languageOptions.templateEngineSyntax !== "object"
        || !languageOptions.templateEngineSyntax)
    ) {
      throw new TypeError(
        "Expected an key-value record value for 'templateEngineSyntax' option.",
      );
    }
    if (
      "rawContentTags" in languageOptions
      && (!Array.isArray(languageOptions.rawContentTags)
        || !languageOptions.rawContentTags.every((tag) => typeof tag === "string"))
    ) {
      throw new TypeError(
        "Expected an array of strings for 'rawContentTags' option.",
      );
    }
  }

  parse(
    file: File,
    context?: { languageOptions: ParserOptions },
  ): ParseResult<HTMLProgram> {
    const code = file.body as string;
    const languageOptions = (context && context.languageOptions) || {};
    try {
      const result = parseForESLint(code, languageOptions);
      const ast = result.ast as unknown as HTMLProgram;

      return {
        ok: true,
        ast,
        comments: ast.comments,
      };
    } catch (e) {
      return {
        ok: false,
        errors: [e as FileError],
      };
    }
  }

  createSourceCode(file: File, parseResult: OkParseResult<HTMLProgram>) {
    return createHTMLSourceCode({
      text: file.body as string,
      ast: parseResult.ast,
      comments: (parseResult as OkParseResult<HTMLProgram> & {
        comments: CommentContent[];
      })
        .comments,
    });
  }
}
