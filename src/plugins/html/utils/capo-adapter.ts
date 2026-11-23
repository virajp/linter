// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/utils/capo-adapter.js.
import { NODE_TYPES } from "@html-eslint/parser";
import type {
  AnyNode,
  ScriptTag,
  StyleTag,
  Tag,
} from "@html-eslint/types";
import {
  findAttr,
  getNameOf,
} from "./node.js";

/** Adapter for HTML ESLint AST nodes to work with capo.js */
export class HtmlEslintAdapter {
  /**
   * Check if node is an Element (Tag, ScriptTag, or StyleTag)
   *
   * @param node - The node to check
   */
  isElement(node: AnyNode): node is Tag | ScriptTag | StyleTag {
    return (
      node.type === NODE_TYPES.Tag
      || node.type === NODE_TYPES.ScriptTag
      || node.type === NODE_TYPES.StyleTag
    );
  }

  /**
   * Get the tag name of an element (lowercase)
   *
   * @param node - Element node
   * @returns - Tag name like 'meta', 'link', 'script'
   */
  getTagName(node: Tag | StyleTag | ScriptTag): string {
    if (!this.isElement(node)) {
      return "";
    }
    return getNameOf(node);
  }

  /**
   * Get attribute value from element
   *
   * @param node - Element node
   * @param attrName - Attribute name (case-insensitive)
   * @returns - Attribute value or null if not found
   */
  getAttribute(
    node: Tag | StyleTag | ScriptTag,
    attrName: string,
  ): string | null {
    if (!this.isElement(node)) {
      return null;
    }

    const attr = findAttr(node, attrName);
    if (!attr || !attr.value) {
      return null;
    }

    return attr.value.value || null;
  }

  /**
   * Check if element has a specific attribute
   *
   * @param node - Element node
   * @param attrName - Attribute name (case-insensitive)
   * @returns - True if attribute exists
   */
  hasAttribute(node: Tag | StyleTag | ScriptTag, attrName: string): boolean {
    if (!this.isElement(node)) {
      return false;
    }

    return !!findAttr(node, attrName);
  }

  /**
   * @param node - Element node
   * @returns - Array of attribute names
   */
  getAttributeNames(node: Tag | StyleTag | ScriptTag): string[] {
    if (!this.isElement(node) || !node.attributes) {
      return [];
    }

    return node
      .attributes
      .filter((attr) => attr.type === NODE_TYPES.Attribute && attr.key)
      .map((attr) => attr.key.value);
  }

  /**
   * @param node - Element node
   * @returns - Text content
   */
  getTextContent(node: Tag | StyleTag | ScriptTag): string {
    if (!this.isElement(node)) {
      return "";
    }

    // ScriptTag and StyleTag have a value property containing the content
    if (
      node.type === NODE_TYPES.ScriptTag
      || node.type === NODE_TYPES.StyleTag
    ) {
      if (node.value && node.value.value) {
        return node.value.value;
      }
    }

    return "";
  }

  /**
   * Get child elements of a node
   *
   * @param node - Parent node
   * @returns - Array of child element nodes (excluding
   *   text/comment nodes)
   */
  getChildren(node: Tag | StyleTag | ScriptTag): Tag["children"] {
    if (node.type !== NODE_TYPES.Tag || !node.children) {
      return [];
    }

    return node.children.filter((child) => this.isElement(child));
  }

  /**
   * Get parent element of a node
   *
   * @param node - Child node
   * @returns - Parent element node, or null if no parent
   */
  getParent(node: AnyNode): any | null {
    return node && node.parent ? node.parent : null;
  }

  /**
   * Get sibling elements of a node
   *
   * @param node - Element node
   * @returns - Array of sibling element nodes (excluding the node
   *   itself)
   */
  getSiblings(node: AnyNode): AnyNode[] {
    const parent = this.getParent(node);
    if (!parent) {
      return [];
    }

    const children = this.getChildren(parent);
    return children.filter((child) => child !== node);
  }

  /**
   * Get source location for a node
   *
   * @param node - Element node
   */
  getLocation(node: any): {
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
  } | null {
    if (!node || !node.loc) {
      return null;
    }

    return {
      line: node.loc.start.line,
      column: node.loc.start.column,
      endLine: node.loc.end.line,
      endColumn: node.loc.end.column,
    };
  }

  /**
   * Stringify element for logging/debugging
   *
   * @param node - Element node
   * @returns - String representation like "<meta charset='utf-8'>"
   */
  /* istanbul ignore next */
  stringify(node: AnyNode): string {
    if (!this.isElement(node)) {
      return "";
    }

    const tagName = this.getTagName(node);
    const attrNames = this.getAttributeNames(node);

    if (attrNames.length === 0) {
      return `<${tagName}>`;
    }

    const attrs = attrNames
      .map((name) => {
        const value = this.getAttribute(node, name);
        if (value === null) {
          return name;
        }
        return `${name}="${value}"`;
      })
      .join(" ");

    return `<${tagName} ${attrs}>`;
  }
}
