// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/adapters/element.js.
import type { ElementAdapter } from "@html-eslint/core";
import { NODE_TYPES } from "@html-eslint/parser";
import type {
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import { getNameOf } from "../utils/node.js";
import { HTMLAttributeAdapter } from "./attribute.js";

export class HTMLElementAdapter implements ElementAdapter {
  node: Tag | ScriptTag | StyleTag;

  constructor(node: Tag | ScriptTag | StyleTag) {
    this.node = node;
  }

  getLocation() {
    return this.node.loc;
  }

  getRange() {
    return this.node.range;
  }

  getElementName() {
    return getNameOf(this.node);
  }

  getOpenStartLocation() {
    return this.node.openStart.loc;
  }

  getOpenStartRange() {
    return this.node.openStart.range;
  }

  getAttributes() {
    return this.node.attributes.map(
      (attribute) => new HTMLAttributeAdapter(attribute),
    );
  }

  getParentContainer() {
    const { parent } = this.node;
    if (!parent || parent.type === NODE_TYPES.Document) {
      return null;
    }
    if (parent.type === NODE_TYPES.Tag) {
      return { name: getNameOf(parent), isCustomElement: false };
    }
    // e.g. a Fragment root when parsing a JS/Lit template literal - the
    // real parent can't be determined statically.
    return { name: "", isCustomElement: true };
  }
}
