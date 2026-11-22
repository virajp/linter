import type { RuleDefinition } from "@eslint/core";

import { preferLogicalProperties } from "./prefer-logical-properties.js";
import { preferThemeTokens } from "./prefer-theme-tokens.js";
import { relativeFontUnits } from "./relative-font-units.js";
import { useBaseline } from "./use-baseline.js";
import { useLayers } from "./use-layers.js";
import { validApplyDirective } from "./valid-apply-directive.js";
import { validModifierSyntax } from "./valid-modifier-syntax.js";
import { validThemeFunction } from "./valid-theme-function.js";

/**
 * Rules `prefer-logical-properties` to `valid-theme-function` of the
 * `tailwindcss` plugin, keyed by their name without the `tailwindcss/` prefix.
 */
export const groupBRules = {
  "prefer-logical-properties": preferLogicalProperties,
  "prefer-theme-tokens": preferThemeTokens,
  "relative-font-units": relativeFontUnits,
  "use-baseline": useBaseline,
  "use-layers": useLayers,
  "valid-apply-directive": validApplyDirective,
  "valid-modifier-syntax": validModifierSyntax,
  "valid-theme-function": validThemeFunction,
} satisfies Record<string, RuleDefinition>;
