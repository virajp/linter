// Ported from @poupe/eslint-plugin-tailwindcss v0.3.1 (MIT), src/types.ts.
/**
 * Type definitions for the tailwindcss plugin
 */

// ------------------------------------------------------------------------------
// Imports
// ------------------------------------------------------------------------------

import type {
  RuleDefinition,
  RuleVisitor,
} from "@eslint/core";
import type {
  CSSLanguageOptions,
  CSSSourceCode,
} from "@eslint/css";
import type {
  CssNodeNames,
  CssNodePlain,
} from "@eslint/css-tree";

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

/** Adds matching `:exit` selectors for all properties of a `RuleVisitor`. */
type WithExit<RuleVisitorType extends RuleVisitor> = {
  [
    Key in keyof RuleVisitorType as
      | `${Key & string}:exit`
      | Key
  ]: RuleVisitorType[Key];
};

// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

type CSSNodeVisitor = {
  [Type in CssNodeNames]: (
    node: Extract<CssNodePlain, { type: Type }>,
  ) => void;
};

/**
 * A visitor for CSS nodes.
 */
export interface CSSRuleVisitor extends Partial<WithExit<CSSNodeVisitor>>, RuleVisitor {}

export type CSSRuleDefinitionTypeOptions = {
  ExtRuleDocs: Record<string, unknown>;
  MessageIds: string;
  RuleOptions: unknown[];
};

/**
 * A rule definition for CSS.
 */
export type CSSRuleDefinition<
  Options extends Partial<CSSRuleDefinitionTypeOptions> = object,
> = RuleDefinition<
  // Language specific type options (non-configurable)
  & Required<
    // Rule specific type options (custom)
    & Options
    // Rule specific type options (defaults)
    & Omit<CSSRuleDefinitionTypeOptions, keyof Options>
  >
  & {
    Code: CSSSourceCode;
    LangOptions: CSSLanguageOptions;
    Node: CssNodePlain;
    Visitor: CSSRuleVisitor;
  }
>;
