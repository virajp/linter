// Ported from @poupe/eslint-plugin-tailwindcss v0.3.1 (MIT), src/rules/relative-font-units.ts.
import type { RuleDefinition } from "@eslint/core";

import { cssRules } from "../utils/css.js";

const coreRule = cssRules["relative-font-units"]!;

/**
 * Wrapper for \@eslint/css relative-font-units rule
 * Prefers rem/em over px for better accessibility
 *
 * A new rule object with a new `meta` that sets `languages`, so the shared
 * `@eslint/css` rule object stays unchanged.
 */
export const relativeFontUnits: RuleDefinition = {
  ...coreRule,
  meta: {
    ...coreRule.meta,
    languages: ["css/css"],
  },
};
