// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/adapters/factory.js.
import type {
  Attribute,
  AttributeKey,
  AttributeValue,
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import { HTMLAttributeKeyAdapter } from "./attribute-key.js";
import { HTMLAttributeValueAdapter } from "./attribute-value.js";
import { HTMLAttributeAdapter } from "./attribute.js";
import { HTMLElementAdapter } from "./element.js";

export function createElementAdapter(node: ScriptTag | StyleTag | Tag) {
  return new HTMLElementAdapter(node);
}

export function createAttributeAdapter(node: Attribute) {
  return new HTMLAttributeAdapter(node);
}

export function createAttributeKeyAdapter(node: AttributeKey) {
  return new HTMLAttributeKeyAdapter(node);
}

export function createAttributeValueAdapter(node: AttributeValue) {
  return new HTMLAttributeValueAdapter(node);
}
