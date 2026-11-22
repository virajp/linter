// Ported from @poupe/eslint-plugin-tailwindcss v0.3.1 (MIT), src/rules/prefer-logical-properties.ts.
import type { RuleDefinition } from "@eslint/core";

import { cssRules } from "../utils/css.js";

const coreRule = cssRules["prefer-logical-properties"]!;

/**
 * Wrapper for \@eslint/css prefer-logical-properties rule
 * Encourages use of logical properties over physical ones for better i18n support
 *
 * This rule is auto-fixable and helps modernize CSS for better internationalization.
 * It replaces physical properties (left, right, top, bottom) with logical ones
 * (inline-start, inline-end, block-start, block-end).
 *
 * A new rule object with a new `meta` that sets `languages`, so the shared
 * `@eslint/css` rule object stays unchanged.
 */
export const preferLogicalProperties: RuleDefinition = {
  ...coreRule,
  meta: {
    ...coreRule.meta,
    languages: ["css/css"],
  },
};
