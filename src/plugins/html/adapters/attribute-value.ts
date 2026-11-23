// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/adapters/attribute-value.js.
import type { AttributeValueAdapter } from "@html-eslint/core";
import type { AttributeValue } from "@html-eslint/types";

export class HTMLAttributeValueAdapter implements AttributeValueAdapter {
  node: AttributeValue;

  constructor(node: AttributeValue) {
    this.node = node;
  }

  getLocation() {
    return this.node.loc;
  }

  getRange() {
    return this.node.range;
  }

  hasExpression() {
    return !!this.node.parts.length;
  }

  getValue() {
    return this.node.value;
  }

  getBooleanValue() {
    return null;
  }
}
