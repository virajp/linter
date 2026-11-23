// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/adapters/attribute-key.js.
import type { AttributeKeyAdapter } from "@html-eslint/core";
import type { AttributeKey } from "@html-eslint/types";
import { hasTemplate } from "../utils/node.js";

export class HTMLAttributeKeyAdapter implements AttributeKeyAdapter {
  node: AttributeKey;

  constructor(node: AttributeKey) {
    this.node = node;
  }

  getValue() {
    return this.node.value;
  }

  hasExpression() {
    return hasTemplate(this.node);
  }

  getRange() {
    return this.node.range;
  }

  getLocation() {
    return this.node.loc;
  }
}
