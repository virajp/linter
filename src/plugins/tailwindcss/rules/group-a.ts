import { consistentSpacing } from "./consistent-spacing.js";
import { noArbitraryValueOveruse } from "./no-arbitrary-value-overuse.js";
import { noConflictingUtilities } from "./no-conflicting-utilities.js";
import { noDuplicateImports } from "./no-duplicate-imports.js";
import { noDuplicateReference } from "./no-duplicate-reference.js";
import { noEmptyBlocks } from "./no-empty-blocks.js";
import { noImportant } from "./no-important.js";
import { noInvalidAtRules } from "./no-invalid-at-rules.js";
import { noInvalidNamedGridAreas } from "./no-invalid-named-grid-areas.js";
import { noInvalidProperties } from "./no-invalid-properties.js";

/**
 * Tailwind CSS rules of group A, keyed by rule name without the
 * `tailwindcss/` prefix.
 */
export const groupARules = {
  "consistent-spacing": consistentSpacing,
  "no-arbitrary-value-overuse": noArbitraryValueOveruse,
  "no-conflicting-utilities": noConflictingUtilities,
  "no-duplicate-imports": noDuplicateImports,
  "no-duplicate-reference": noDuplicateReference,
  "no-empty-blocks": noEmptyBlocks,
  "no-important": noImportant,
  "no-invalid-at-rules": noInvalidAtRules,
  "no-invalid-named-grid-areas": noInvalidNamedGridAreas,
  "no-invalid-properties": noInvalidProperties,
};
