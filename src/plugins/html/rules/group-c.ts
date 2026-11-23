// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/index.js (rule registry, group C).
import type { RuleModule } from "../types/index.js";
import noPositiveTabindex from "./no-positive-tabindex.js";
import noRedundantRole from "./no-redundant-role.js";
import noRestrictedAttrValues from "./no-restricted-attr-values.js";
import noRestrictedAttrs from "./no-restricted-attrs.js";
import noRestrictedTags from "./no-restricted-tags.js";
import noScriptStyleType from "./no-script-style-type.js";
import noSkipHeadingLevels from "./no-skip-heading-levels.js";
import noTargetBlank from "./no-target-blank.js";
import noTrailingSpaces from "./no-trailing-spaces.js";
import noWhitespaceOnlyChildren from "./no-whitespace-only-children.js";
import preferHttps from "./prefer-https.js";
import quotes from "./quotes.js";
import requireAttrs from "./require-attrs.js";
import requireButtonType from "./require-button-type.js";
import requireClosingTags from "./require-closing-tags.js";
import requireContent from "./require-content.js";

export const groupCRules: Record<string, RuleModule<any[]>> = {
  "no-positive-tabindex": noPositiveTabindex,
  "no-redundant-role": noRedundantRole,
  "no-restricted-attr-values": noRestrictedAttrValues,
  "no-restricted-attrs": noRestrictedAttrs,
  "no-restricted-tags": noRestrictedTags,
  "no-script-style-type": noScriptStyleType,
  "no-skip-heading-levels": noSkipHeadingLevels,
  "no-target-blank": noTargetBlank,
  "no-trailing-spaces": noTrailingSpaces,
  "no-whitespace-only-children": noWhitespaceOnlyChildren,
  "prefer-https": preferHttps,
  "quotes": quotes,
  "require-attrs": requireAttrs,
  "require-button-type": requireButtonType,
  "require-closing-tags": requireClosingTags,
  "require-content": requireContent,
};
