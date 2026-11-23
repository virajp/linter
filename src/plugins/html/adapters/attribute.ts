// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/adapters/attribute.js.
import type { AttributeAdapter } from "@html-eslint/core";
import type { Attribute } from "@html-eslint/types";
import { HTMLAttributeKeyAdapter } from "./attribute-key.js";
import { HTMLAttributeValueAdapter } from "./attribute-value.js";

export class HTMLAttributeAdapter implements AttributeAdapter {
  node: Attribute;

  constructor(node: Attribute) {
    this.node = node;
  }

  getKey() {
    return new HTMLAttributeKeyAdapter(this.node.key);
  }

  getValue() {
    if (!this.node.value) {
      return null;
    }
    return new HTMLAttributeValueAdapter(this.node.value);
  }

  isSpread() {
    return false;
  }

  getLocation() {
    return this.node.loc;
  }
}
