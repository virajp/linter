// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/index.js (rule registry, group B).
import type { RuleModule } from "../types/index.js";
import noDuplicateInHead from "./no-duplicate-in-head.js";
import noEmptyHeadings from "./no-empty-headings.js";
import noExtraSpacingTags from "./no-extra-spacing-tags.js";
import noExtraSpacingText from "./no-extra-spacing-text.js";
import noHeadingInsideButton from "./no-heading-inside-button.js";
import noIneffectiveAttrs from "./no-ineffective-attrs.js";
import noInlineStyles from "./no-inline-styles.js";
import noInvalidAttrValue from "./no-invalid-attr-value.js";
import noInvalidEntity from "./no-invalid-entity.js";
import noInvalidRole from "./no-invalid-role.js";
import noMultipleEmptyLines from "./no-multiple-empty-lines.js";
import noMultipleH1 from "./no-multiple-h1.js";
import noNestedInteractive from "./no-nested-interactive.js";
import noNonScalableViewport from "./no-non-scalable-viewport.js";
import noObsoleteAttrs from "./no-obsolete-attrs.js";
import noObsoleteTags from "./no-obsolete-tags.js";

export const groupBRules: Record<string, RuleModule<any[]>> = {
  "no-duplicate-in-head": noDuplicateInHead,
  "no-empty-headings": noEmptyHeadings,
  "no-extra-spacing-tags": noExtraSpacingTags,
  "no-extra-spacing-text": noExtraSpacingText,
  "no-heading-inside-button": noHeadingInsideButton,
  "no-ineffective-attrs": noIneffectiveAttrs,
  "no-inline-styles": noInlineStyles,
  "no-invalid-attr-value": noInvalidAttrValue,
  "no-invalid-entity": noInvalidEntity,
  "no-invalid-role": noInvalidRole,
  "no-multiple-empty-lines": noMultipleEmptyLines,
  "no-multiple-h1": noMultipleH1,
  "no-nested-interactive": noNestedInteractive,
  "no-non-scalable-viewport": noNonScalableViewport,
  "no-obsolete-attrs": noObsoleteAttrs,
  "no-obsolete-tags": noObsoleteTags,
};
