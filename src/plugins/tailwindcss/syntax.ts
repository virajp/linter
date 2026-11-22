/**
 * Tailwind CSS 4 syntax for CSSTree, passed to `@eslint/css` as the
 * `customSyntax` language option.
 *
 * Written for this package. The Tailwind 4 CSSTree syntax that
 * THIRD_PARTY_NOTICES.md acknowledges (Apache-2.0) was the reference for the
 * at-rules, types and node shapes it supports.
 */

import type { SyntaxConfig } from "@eslint/css-tree";

// ---------------------------------------------------------------------------
// Parser surface
// ---------------------------------------------------------------------------

/** A parsed CSSTree node, as the parser methods below return it. */
type ParsedNode = { type: string; [key: string]: unknown };

/** The CSSTree `List` methods that this syntax calls. */
interface NodeList {
  appendData(data: unknown): void;
  readonly isEmpty: boolean;
  push(node: unknown): void;
}

/**
 * The part of the CSSTree parser context (`this` inside a parse function)
 * that this syntax uses. `@eslint/css-tree` does not export its own type.
 */
interface Parser {
  source: string;
  tokenType: number;
  tokenStart: number;
  tokenEnd: number;
  tokenIndex: number;
  eof: boolean;
  important: boolean;
  parseValue: boolean;
  parseCustomProperty: boolean;
  readSequence: unknown;
  consumeUntilExclamationMarkOrSemicolon: unknown;
  consumeUntilLeftCurlyBracketOrSemicolon: unknown;

  next(): void;
  skipSC(): void;
  eat(tokenType: number): void;
  consume(tokenType: number): string;
  cmpStr(start: number, end: number, text: string): boolean;
  charCodeAt(offset: number): number;
  isDelim(code: number, offset?: number): boolean;
  isBalanceEdge(tokenIndex: number): boolean;
  lookupType(offset: number): number;
  lookupTypeNonSC(index: number): number;
  lookupOffsetNonSC(index: number): number;
  lookupNonWSType(offset: number): number;
  getTokenStart(tokenIndex: number): number;
  substrToCursor(start: number): string;
  getLocation(start: number, end: number): unknown;
  createList(): NodeList;
  error(message?: string, offset?: number): void;
  parseWithFallback(
    consumer: (this: Parser) => ParsedNode,
    fallback: (this: Parser) => ParsedNode,
  ): ParsedNode;

  Brackets(readSequence: unknown, recognizer: unknown): ParsedNode;
  Condition(kind: string): ParsedNode;
  Declaration(): ParsedNode;
  Function(
    readSequence: unknown,
    recognizer: Record<string, (this: Parser) => NodeList>,
  ): ParsedNode;
  Identifier(): ParsedNode & { name: string };
  Layer(): ParsedNode;
  MediaQueryList(): ParsedNode;
  Number(): ParsedNode;
  Operator(): ParsedNode;
  Percentage(): ParsedNode;
  Raw(consumeUntil: unknown, excludeWhiteSpace: boolean): ParsedNode;
  String(): ParsedNode;
  TailwindThemeKey(recognizer: unknown): ParsedNode;
  TailwindUtilityClass(): ParsedNode;
  Url(): ParsedNode;
  Value(): ParsedNode & { children: NodeList };
}

/** The CSSTree generator context (`this` inside a generate function). */
interface Generator {
  children(node: unknown): void;
  node(node: unknown): void;
  token(tokenType: number, value: string): void;
}

/** CSSTree token type codes. */
const TOKEN = {
  EOF: 0,
  Ident: 1,
  Function: 2,
  Hash: 4,
  String: 5,
  Url: 7,
  Delim: 9,
  Number: 10,
  WhiteSpace: 13,
  Colon: 16,
  Semicolon: 17,
  LeftSquareBracket: 19,
  RightSquareBracket: 20,
  LeftParenthesis: 21,
  RightParenthesis: 22,
} as const;

/** Character codes. */
const CHAR = {
  bang: 0x21,
  hash: 0x23,
  dollar: 0x24,
  ampersand: 0x26,
  star: 0x2a,
  plus: 0x2b,
  hyphen: 0x2d,
  dot: 0x2e,
  slash: 0x2f,
} as const;

// ---------------------------------------------------------------------------
// Declaration (with `--name-*` wildcard properties)
// ---------------------------------------------------------------------------

/** Reads the property name, including a trailing `*` after `--name-`. */
function readPropertyName(this: Parser): string {
  const start = this.tokenStart;

  if (this.tokenType === TOKEN.Delim) {
    const code = this.charCodeAt(this.tokenStart);
    if (
      code === CHAR.star
      || code === CHAR.dollar
      || code === CHAR.plus
      || code === CHAR.hash
      || code === CHAR.ampersand
    ) {
      this.next();
    } else if (code === CHAR.slash) {
      this.next();
      if (this.isDelim(CHAR.slash)) { this.next(); }
    }
  }

  this.eat(this.tokenType === TOKEN.Hash ? TOKEN.Hash : TOKEN.Ident);

  const isWildcard = this.substrToCursor(start).startsWith("--")
    && this.isDelim(CHAR.star)
    && this.lookupTypeNonSC(1) === TOKEN.Colon;
  if (isWildcard) { this.next(); }

  return this.substrToCursor(start);
}

function rawValue(this: Parser): ParsedNode {
  return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, true);
}

function rawCustomValue(this: Parser): ParsedNode {
  return this.Raw(this.consumeUntilExclamationMarkOrSemicolon, false);
}

function parsedValue(this: Parser): ParsedNode {
  const firstToken = this.tokenIndex;
  const value = this.Value();
  const endsCleanly = value.type === "Raw"
    || this.eof
    || this.tokenType === TOKEN.Semicolon
    || this.isDelim(CHAR.bang)
    || this.isBalanceEdge(firstToken);
  if (!endsCleanly) { this.error(); }
  return value;
}

function readImportant(this: Parser): true | string {
  this.eat(TOKEN.Delim);
  this.skipSC();
  const word = this.consume(TOKEN.Ident);
  return word === "important" ? true : word;
}

function parseDeclaration(this: Parser): ParsedNode {
  const start = this.tokenStart;
  const firstToken = this.tokenIndex;
  const property = readPropertyName.call(this);
  const isCustom = property.startsWith("--");
  const shouldParse = isCustom ? this.parseCustomProperty : this.parseValue;
  const raw = isCustom ? rawCustomValue : rawValue;

  this.skipSC();
  this.eat(TOKEN.Colon);
  const valueStart = this.tokenIndex;
  if (!isCustom) { this.skipSC(); }

  const value = shouldParse
    ? this.parseWithFallback(parsedValue, raw)
    : raw.call(this);

  // An empty custom property value keeps one space, as CSSTree does.
  if (
    isCustom
    && value.type === "Value"
    && (value["children"] as NodeList).isEmpty
  ) {
    for (let offset = valueStart - this.tokenIndex; offset <= 0; offset++) {
      if (this.lookupType(offset) === TOKEN.WhiteSpace) {
        (value["children"] as NodeList).appendData({
          type: "WhiteSpace",
          loc: null,
          value: " ",
        });
        break;
      }
    }
  }

  let important: boolean | string = false;
  if (this.isDelim(CHAR.bang)) {
    important = readImportant.call(this);
    this.skipSC();
  }

  if (
    !this.eof
    && this.tokenType !== TOKEN.Semicolon
    && !this.isBalanceEdge(firstToken)
  ) {
    this.error();
  }

  return {
    type: "Declaration",
    loc: this.getLocation(start, this.tokenStart),
    important,
    property,
    value,
  };
}

function generateDeclaration(
  this: Generator,
  node: { important: boolean | string; property: string; value: unknown },
): void {
  if (node.property.startsWith("--") && node.property.endsWith("*")) {
    this.token(TOKEN.Ident, node.property.slice(0, -1));
    this.token(TOKEN.Delim, "*");
  } else {
    this.token(TOKEN.Ident, node.property);
  }
  this.token(TOKEN.Colon, ":");
  this.node(node.value);
  if (node.important) {
    this.token(TOKEN.Delim, "!");
    this.token(
      TOKEN.Ident,
      node.important === true ? "important" : node.important,
    );
  }
}

const declarationNode = {
  name: "Declaration",
  structure: {
    important: [Boolean, String],
    property: String,
    value: ["Value", "Raw"],
  },
  parse: parseDeclaration,
  generate: generateDeclaration,
};

/** True when the current tokens start a `--name-*:` declaration. */
function atWildcardProperty(this: Parser): boolean {
  if (
    this.tokenType !== TOKEN.Ident
    || this.charCodeAt(this.tokenStart) !== CHAR.hyphen
    || this.charCodeAt(this.tokenStart + 1) !== CHAR.hyphen
    || this.lookupTypeNonSC(1) !== TOKEN.Delim
    || this.lookupTypeNonSC(2) !== TOKEN.Colon
  ) {
    return false;
  }
  const starIndex = this.tokenIndex + this.lookupOffsetNonSC(1);
  return this.charCodeAt(this.getTokenStart(starIndex)) === CHAR.star;
}

/**
 * Keeps an existing Declaration parser and sends only wildcard properties to
 * ours. With no existing parser, ours parses every declaration.
 */
function declarationFor(previous: unknown): unknown {
  const node = typeof previous === "function"
    ? { parse: previous }
    : previous as { parse?: unknown } | undefined;
  const baseParse = node?.parse as ((this: Parser) => ParsedNode) | undefined;
  if (!baseParse) { return declarationNode; }

  return {
    ...node,
    parse(this: Parser): ParsedNode {
      return atWildcardProperty.call(this)
        ? parseDeclaration.call(this)
        : baseParse.call(this);
    },
  };
}

// ---------------------------------------------------------------------------
// TailwindUtilityClass (`hover:bg-red-500`, `grid-cols-[1fr_2fr]`)
// ---------------------------------------------------------------------------

type IdentifierNode = ParsedNode & { name: string };

function parseUtilityClass(this: Parser): ParsedNode {
  this.skipSC();
  const start = this.tokenStart;
  let utility: IdentifierNode = this.Identifier();
  let variant: IdentifierNode | null = null;

  if (this.tokenType === TOKEN.Colon) {
    this.next();
    variant = utility;
    utility = this.Identifier();
  }

  // An arbitrary value: append the balanced `[...]` text to the name.
  if (this.tokenType === TOKEN.LeftSquareBracket) {
    const bracketStart = this.tokenStart;
    let depth = 0;
    do {
      if (this.tokenType === TOKEN.LeftSquareBracket) { depth++; }
      else if (this.tokenType === TOKEN.RightSquareBracket) { depth--; }
      this.next();
    } while (depth > 0 && (this.tokenType as number) !== TOKEN.EOF);
    utility = {
      ...utility,
      name: utility.name + this.source.slice(bracketStart, this.tokenStart),
    };
  }

  this.skipSC();
  return {
    type: "TailwindUtilityClass",
    loc: this.getLocation(start, this.tokenStart),
    name: utility,
    variant,
  };
}

function generateUtilityClass(
  this: Generator,
  node: { name: { name: string }; variant: { name: string } | null },
): void {
  if (node.variant) {
    this.token(TOKEN.Ident, node.variant.name);
    this.token(TOKEN.Colon, ":");
  }
  this.token(TOKEN.Ident, node.name.name);
}

const utilityClassNode = {
  name: "TailwindUtilityClass",
  structure: {
    name: ["Identifier"],
    variant: ["Identifier", null],
  },
  parse: parseUtilityClass,
  generate: generateUtilityClass,
};

// ---------------------------------------------------------------------------
// TailwindThemeKey and the theme() scope (`theme(colors.gray.900 / 75%)`)
// ---------------------------------------------------------------------------

function parseThemeKey(this: Parser, recognizer: unknown): ParsedNode {
  const start = this.tokenStart;
  const children = this.createList();

  this.skipSC();
  children.push(this.Identifier());

  while (this.isDelim(CHAR.dot)) {
    children.push(this.Operator());
    if (this.tokenType === TOKEN.Ident) {
      children.push(this.Identifier());
    } else {
      this.error(
        "Expected identifier, square bracket, or number after '.' in theme function.",
      );
    }
  }

  if (this.tokenType === TOKEN.LeftSquareBracket) {
    children.push(this.Brackets(this.readSequence, recognizer));
  }

  // `.900` is one number token: split off the dot as an Operator.
  if (this.tokenType === TOKEN.Number) {
    if (this.source.charCodeAt(this.tokenStart) === CHAR.dot) {
      const dotStart = this.tokenStart;
      this.tokenStart = dotStart + 1;
      children.push({
        type: "Operator",
        loc: this.getLocation(dotStart, dotStart + 1),
        value: this.substrToCursor(dotStart),
      });
    }
    children.push(this.Number());
  }

  this.skipSC();
  return {
    type: "TailwindThemeKey",
    loc: this.getLocation(start, this.tokenStart),
    children,
  };
}

const themeKeyNode = {
  name: "TailwindThemeKey",
  structure: {
    name: String,
    children: [[]],
  },
  parse: parseThemeKey,
  generate(this: Generator, node: unknown): void {
    this.children(node);
  },
};

/** The arguments of `theme()`: a key, then an optional `/ <percentage>`. */
function themeArguments(this: Parser, recognizer: unknown): NodeList {
  const children = this.createList();
  children.push(this.TailwindThemeKey(recognizer));
  if (this.isDelim(CHAR.slash)) {
    children.push(this.Operator());
    this.skipSC();
    children.push(this.Percentage());
    this.skipSC();
  }
  return children;
}

// ---------------------------------------------------------------------------
// At-rule preludes
// ---------------------------------------------------------------------------

/** `@apply <utility>+ [!important]?` */
function applyPrelude(this: Parser): NodeList {
  const children = this.createList();
  this.important = false;

  while (this.tokenType === TOKEN.Ident) {
    const next = this.lookupType(1);
    children.push(
      next === TOKEN.Colon || next === TOKEN.LeftSquareBracket
        ? this.TailwindUtilityClass()
        : this.Identifier(),
    );
    this.skipSC();
  }

  if (this.isDelim(CHAR.bang)) {
    this.next();
    this.skipSC();
    const isImportantWord = this.tokenType === TOKEN.Ident
      && this.cmpStr(this.tokenStart, this.tokenEnd, "important");
    if (!isImportantWord) {
      this.error(
        "Expected 'important' keyword after '!' in @apply directive",
        0,
      );
    }
    this.Identifier();
    this.important = true;
    this.skipSC();
  }

  return children;
}

/** `@custom-variant <name> [ (<selector>) ]?` */
function customVariantPrelude(this: Parser): NodeList {
  const children = this.createList();
  if (this.tokenType !== TOKEN.Ident) {
    this.error("Expected variant name identifier after @custom-variant", 0);
  }
  children.push(this.Identifier());
  this.skipSC();
  if (this.tokenType === TOKEN.LeftParenthesis) {
    children.push(
      this.Raw(this.consumeUntilLeftCurlyBracketOrSemicolon, true),
    );
  }
  return children;
}

/**
 * Parses one argument of an `@import` function; on failure, or when the
 * argument does not end at `)`, falls back to `fallback` or a Raw node.
 */
function importArgument(
  this: Parser,
  consumer: (this: Parser) => ParsedNode,
  fallback?: (this: Parser) => ParsedNode,
): ParsedNode {
  const self = this;
  return this.parseWithFallback(
    function(this: Parser) {
      try {
        return consumer.call(this);
      } finally {
        this.skipSC();
        if (this.lookupNonWSType(0) !== TOKEN.RightParenthesis) { this.error(); }
      }
    },
    fallback ?? (() => self.Raw(null, true)),
  );
}

function argumentList(this: Parser, node: ParsedNode): NodeList {
  const children = this.createList();
  if (node.type !== "Raw" || node["value"] !== "") { children.push(node); }
  return children;
}

const importFunctions: Record<string, (this: Parser) => NodeList> = {
  layer(this: Parser): NodeList {
    this.skipSC();
    return argumentList.call(this, importArgument.call(this, this.Layer));
  },
  supports(this: Parser): NodeList {
    this.skipSC();
    const self = this;
    const node = importArgument.call(
      this,
      this.Declaration,
      () => importArgument.call(self, () => self.Condition("supports")),
    );
    return argumentList.call(this, node);
  },
  source(this: Parser): NodeList {
    this.skipSC();
    const self = this;
    const node = importArgument.call(
      this,
      this.String,
      () => importArgument.call(self, self.Identifier),
    );
    return argumentList.call(this, node);
  },
  prefix(this: Parser): NodeList {
    this.skipSC();
    return argumentList.call(
      this,
      importArgument.call(this, this.Identifier),
    );
  },
};

function atFunction(this: Parser, ...names: string[]): boolean {
  return this.tokenType === TOKEN.Function
    && names.some((name) => this.cmpStr(this.tokenStart, this.tokenEnd, name));
}

/**
 * `@import <string>|<url> [source()|prefix()|layer|layer()]* [supports()]?
 * <media-query-list>?`
 */
function importPrelude(this: Parser): NodeList {
  const children = this.createList();

  if (this.tokenType === TOKEN.String) {
    children.push(this.String());
  } else if (
    this.tokenType === TOKEN.Url || this.tokenType === TOKEN.Function
  ) {
    children.push(this.Url());
  } else {
    this.error("String or url() is expected");
  }

  for (;;) {
    this.skipSC();
    if (atFunction.call(this, "source(", "prefix(", "layer(")) {
      children.push(this.Function(null, importFunctions));
    } else if (
      this.tokenType === TOKEN.Ident
      && this.cmpStr(this.tokenStart, this.tokenEnd, "layer")
    ) {
      children.push(this.Identifier());
    } else {
      break;
    }
  }

  this.skipSC();
  if (atFunction.call(this, "supports(")) {
    children.push(this.Function(null, importFunctions));
  }

  const next = this.lookupNonWSType(0);
  if (next === TOKEN.Ident || next === TOKEN.LeftParenthesis) {
    children.push(this.MediaQueryList());
  }

  return children;
}

// ---------------------------------------------------------------------------
// The syntax extension
// ---------------------------------------------------------------------------

/** What `@eslint/css` passes in: at least the default syntax data. */
type BaseSyntax =
  & Pick<SyntaxConfig, "atrules" | "properties" | "types">
  & Partial<SyntaxConfig>;

/** The extended syntax: the base plus the Tailwind parts. */
type TailwindSyntax =
  & Partial<SyntaxConfig>
  & Pick<SyntaxConfig, "atrule" | "atrules" | "node" | "scope" | "types">;

/** Lexer types for theme() arguments. */
const THEME_TYPES: Record<string, string> = {
  "tw-theme-spacing": "<tw-theme-spacing-number> | <tw-theme-spacing-brackets>",
  "tw-theme-spacing-number": "theme(spacing '.' <integer>)",
  "tw-theme-spacing-brackets": "theme(spacing '[' <number> ']' )",
  "tw-theme-color": "theme(colors '.' <ident-token> '.' [<ident-token> | <number>] [ / <percentage>]?)",
  "tw-theme-screens": "theme(screens '.' <ident-token>)",
};

/**
 * Extends a CSSTree syntax with Tailwind CSS 4: the Tailwind at-rules
 * (`@apply`, `@theme`, `@source`, `@utility`, `@variant`, `@custom-variant`,
 * `@slot`, `@config`, `@plugin`, `@reference`, and the v3 `@tailwind`), the
 * Tailwind `@import` options, the `--alpha()`, `--spacing()` and `theme()`
 * functions, and `--name-*` wildcard custom properties.
 */
export const tailwindSyntax = (previous: BaseSyntax): TailwindSyntax => {
  const { types } = previous;
  const extension = {
    ...previous,
    atrule: {
      ...previous.atrule,
      "apply": { parse: { prelude: applyPrelude, block: null } },
      "custom-variant": { parse: { prelude: customVariantPrelude } },
      "import": { parse: { prelude: importPrelude, block: null } },
    },
    atrules: {
      ...previous.atrules,
      "import": {
        prelude: "[ <string> | <url> ] "
          + "[ [ source( [ <string> | none ] ) ]? || [ prefix( <ident> ) ]? "
          + "|| [ layer | layer( <layer-name> ) ]? ] "
          + "[ supports( [ <supports-condition> | <declaration> ] ) ]? "
          + "<media-query-list>?",
      },
      "apply": { prelude: "<tw-apply-ident>+" },
      "config": { prelude: "<string>" },
      "theme": {
        prelude: "[ inline | static ]?",
        descriptors: previous.properties,
      },
      "source": { prelude: "not? [ <string> | inline(<string>) ]" },
      "utility": { prelude: "<ident>", descriptors: previous.properties },
      "variant": { prelude: "<ident>", descriptors: previous.properties },
      "custom-variant": { prelude: "<ident> [ '(' <any-value> ')' ]?" },
      "slot": { prelude: null },
      "plugin": { prelude: "<string>" },
      "reference": { prelude: "<string>" },
      "tailwind": { prelude: "base | components | utilities | variants" },
    },
    types: {
      ...types,
      "length-percentage": `${types["length-percentage"]} | <tw-any-spacing>`,
      "color": `${types["color"]} | <tw-any-color>`,
      "tw-alpha": "--alpha(<color> / <percentage>)",
      "tw-spacing": "--spacing(<number>)",
      "tw-any-spacing": "<tw-spacing> | <tw-theme-spacing>",
      "tw-any-color": "<tw-alpha> | <tw-theme-color>",
      "tw-apply-ident": "<ident> | <tw-utility-with-variant> | <tw-utility-with-opacity>",
      "tw-utility-with-variant": "[ <ident> ':' <ident> ] "
        + "| [ <ident> ':' <ident> '/' <number> ] "
        + "| [ <ident> ':' <ident> '/' <ident> ]",
      "tw-utility-with-opacity": "[ <ident> '/' <number> ] | [ <ident> '/' <ident> ]",
      ...THEME_TYPES,
    },
    node: {
      ...previous.node,
      Declaration: declarationFor(previous.node?.["Declaration"]),
      TailwindThemeKey: themeKeyNode,
      TailwindUtilityClass: utilityClassNode,
    },
    scope: {
      ...previous.scope,
      Value: {
        ...previous.scope?.["Value"],
        theme: themeArguments,
      },
    },
  };
  return extension as unknown as TailwindSyntax;
};
