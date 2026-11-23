// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/indent/indent-level.js.
import type { AnyNode } from "@html-eslint/types";

export type IncLevelOptions = { [key in AnyNode["type"]]?: number };

export type GetIncreasingLevel = (node: AnyNode) => number;

class IndentLevel {
  private level: number;
  private baseLevel: number;
  private getInc: GetIncreasingLevel;

  constructor(config: { getIncreasingLevel: GetIncreasingLevel }) {
    this.level = -1;
    this.baseLevel = 0;
    this.getInc = config.getIncreasingLevel;
  }

  value(): number {
    return this.level + this.baseLevel;
  }

  indent(node: AnyNode) {
    this.level += this.getInc(node);
  }

  dedent(node: AnyNode) {
    this.level -= this.getInc(node);
  }

  setBase(base: number) {
    this.baseLevel = base;
  }
}

export default IndentLevel;
