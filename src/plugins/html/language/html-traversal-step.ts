// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/languages/html-traversal-step.js.
import { VisitNodeStep } from "@eslint/plugin-kit";
import type { HTMLProgram } from "@html-eslint/parser";
import type { AnyHTMLNode } from "@html-eslint/types";

export const STEP_PHASE = {
  ENTER: 1 as const,
  EXIT: 2 as const,
};

export class HTMLTraversalStep extends VisitNodeStep {
  override target: AnyHTMLNode | HTMLProgram;

  constructor({
    target,
    phase,
    args,
  }: {
    target: AnyHTMLNode | HTMLProgram;
    phase: 1 | 2;
    args: any[];
  }) {
    super({ target, phase, args });
    this.target = target;
  }
}
