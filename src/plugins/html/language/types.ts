// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/languages/types.ts.
import type {
  HTMLComment,
  HTMLProgram,
  ParserOptions,
} from "@html-eslint/parser";
import type {
  AnyHTMLNode,
  AnyToken,
} from "@html-eslint/types";

export type SourceCodeOptions = {
  LangOptions: ParserOptions;
  RootNode: HTMLProgram;
  SyntaxElementWithLoc: AnyHTMLNode;
  ConfigNode: HTMLComment;
};

export type TokenOrHTMLComment = AnyToken | HTMLComment;
