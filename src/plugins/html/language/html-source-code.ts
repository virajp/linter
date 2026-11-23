// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/languages/html-source-code.js.
import type { TraversalStep } from "@eslint/core";
import {
  ConfigCommentParser,
  Directive,
  TextSourceCodeBase,
} from "@eslint/plugin-kit";
import type {
  DirectiveType,
  SourceLocation,
} from "@eslint/plugin-kit";
import { visitorKeys } from "@html-eslint/parser";
import type {
  HTMLComment,
  HTMLProgram,
} from "@html-eslint/parser";
import type {
  AnyHTMLNode,
  CommentContent,
  NodeOrTokenData,
} from "@html-eslint/types";
import type { Scope } from "eslint";
import type { BaseNode } from "../types/index.js";
import {
  HTMLTraversalStep,
  STEP_PHASE,
} from "./html-traversal-step.js";
import type { SourceCodeOptions } from "./types.js";

const lineBreakPattern = /\r\n|[\r\n\u2028\u2029]/u;

function createGlobalLinebreakMatcher() {
  return new RegExp(lineBreakPattern.source, "gu");
}

const INLINE_CONFIG = /^\s*(?:eslint(?:-enable|-disable(?:(?:-next)?-line)?)?)(?:\s|$)/u;

const commentParser = new ConfigCommentParser();

export class HTMLSourceCode extends TextSourceCodeBase<SourceCodeOptions> {
  override ast: HTMLProgram;

  comments: CommentContent[];

  parentsMap: Map<any, any>;

  lineStartIndices: number[];

  constructor(
    { ast, text, comments }: {
      ast: HTMLProgram;
      text: string;
      comments: CommentContent[];
    },
  ) {
    super({ ast, text });

    this.ast = ast;
    this.comments = comments;
    this.parentsMap = new Map();

    this.lineStartIndices = [0];

    const lineEndingPattern = createGlobalLinebreakMatcher();
    let match;
    while ((match = lineEndingPattern.exec(this.text))) {
      this.lineStartIndices.push(match.index + match[0].length);
    }
  }

  override getRange(node: BaseNode): [number, number] {
    return node.range;
  }

  override getLoc(node: BaseNode): SourceLocation {
    return node.loc;
  }

  getLines() {
    return this.lines;
  }

  getAllComments(): CommentContent[] {
    return [];
  }

  getInlineConfigNodes() {
    return this.comments.filter((comment) => INLINE_CONFIG.test(comment.value));
  }

  getDisableDirectives() {
    const problems: {
      ruleId: null | string;
      message: string;
      loc: SourceLocation;
    }[] = [];
    const directives: Directive[] = [];

    this.getInlineConfigNodes().forEach((comment) => {
      const parsed = commentParser.parseDirective(comment.value);
      if (!parsed) { return; }
      const { label, value, justification } = parsed;
      // `eslint-disable-line` directives are not allowed to span multiple lines as it would be confusing to which lines they apply
      if (
        label === "eslint-disable-line"
        && comment.loc.start.line !== comment.loc.end.line
      ) {
        const message = `${label} comment should not span multiple lines.`;

        problems.push({
          ruleId: null,
          message,
          loc: comment.loc,
        });
        return;
      }

      switch (label) {
        case "eslint-disable":
        case "eslint-enable":
        case "eslint-disable-next-line":
        case "eslint-disable-line": {
          const directiveType = label.slice("eslint-".length);
          directives.push(
            new Directive({
              type: directiveType as DirectiveType,
              node: comment,
              value,
              justification,
            }),
          );
        }
      }
    });

    return { problems, directives };
  }

  override traverse() {
    const steps: TraversalStep[] = [];

    const visit = (
      node: AnyHTMLNode | HTMLProgram,
      parent: AnyHTMLNode | HTMLProgram | null,
    ) => {
      this.parentsMap.set(node, parent);
      (node as any).parent = parent;
      steps.push(
        new HTMLTraversalStep({
          target: node,
          phase: STEP_PHASE.ENTER,
          args: [node, parent],
        }),
      );
      for (
        const key of (visitorKeys as Record<string, string[]>)[node.type] || []
      ) {
        const child = (node as any)[key];

        if (child) {
          if (Array.isArray(child)) {
            child.forEach((grandchild) => {
              visit(grandchild, node);
            });
          } else {
            visit(child, node);
          }
        }
      }
      steps.push(
        new HTMLTraversalStep({
          target: node,
          phase: STEP_PHASE.EXIT,
          args: [node, parent],
        }),
      );
    };
    visit(this.ast, null);

    return steps;
  }

  override getParent(node: AnyHTMLNode) {
    return this.parentsMap.get(node);
  }

  // TODO the following methods are stubs

  getJSDocComment(_node: NodeOrTokenData): HTMLComment | null {
    return null;
  }

  /** Stub implementations for ESLint's SourceCode API Compatibility */

  /**
   * @deprecated HTM does not have scopes
   */
  getScope(node: NodeOrTokenData): Scope.Scope | null {
    if (node?.type !== "Program") {
      return null;
    }
    return createFakeGlobalScope(this.ast);
  }

  /**
   * @deprecated HTML does not have scopes
   */
  get scopeManager(): Scope.ScopeManager | null {
    return {
      scopes: [],
      globalScope: createFakeGlobalScope(this.ast),
      acquire: (node) => {
        if (node.type === "Program") {
          return createFakeGlobalScope(this.ast);
        }
        return null;
      },
      getDeclaredVariables: () => [],
      addGlobals(..._: any[]) {},
    } as Scope.ScopeManager;
  }
}

export function createHTMLSourceCode(
  config: { ast: HTMLProgram; text: string; comments: CommentContent[] },
): HTMLSourceCode {
  return new HTMLSourceCode(config);
}

/**
 * @deprecated HTML does not have scopes
 */
function createFakeGlobalScope(node: HTMLProgram): Scope.Scope {
  const fakeGlobalScope = {
    type: "global",
    block: node,
    set: new Map(),
    through: [],
    childScopes: [],
    variableScope: null,
    variables: [],
    references: [],
    functionExpressionScope: false,
    isStrict: false,
    upper: null,
    implicit: {
      variables: [],
      set: new Map(),
    },
  } as unknown as Scope.Scope;
  fakeGlobalScope.variableScope = fakeGlobalScope;
  return fakeGlobalScope;
}
