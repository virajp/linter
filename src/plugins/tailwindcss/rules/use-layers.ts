// Ported from @poupe/eslint-plugin-tailwindcss v0.3.1 (MIT), src/rules/use-layers.ts.
import type { RuleDefinition } from "@eslint/core";

import { cssRules } from "../utils/css.js";

const coreRule = cssRules["use-layers"]!;

/**
 * Wrapper for \@eslint/css use-layers rule
 * Encourages use of `@layer` for better CSS architecture
 *
 * A new rule object with a new `meta` that sets `languages`, so the shared
 * `@eslint/css` rule object stays unchanged.
 */
export const useLayers: RuleDefinition = {
  ...coreRule,
  meta: {
    ...coreRule.meta,
    languages: ["css/css"],
  },
};
