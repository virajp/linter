// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/index.js (rule registry, group A).
import type { RuleModule } from "../types/index.js";
import attrsNewline from "./attrs-newline.js";
import classSpacing from "./class-spacing.js";
import cssNoEmptyBlocks from "./css-no-empty-blocks.js";
import elementNewline from "./element-newline.js";
import headOrder from "./head-order.js";
import idNamingConvention from "./id-naming-convention.js";
import indent from "./indent/index.js";
import lowercase from "./lowercase.js";
import maxElementDepth from "./max-element-depth.js";
import noAbstractRoles from "./no-abstract-roles.js";
import noAccesskeyAttrs from "./no-accesskey-attrs.js";
import noAriaHiddenBody from "./no-aria-hidden-body.js";
import noAriaHiddenOnFocusable from "./no-aria-hidden-on-focusable.js";
import noDuplicateAttrs from "./no-duplicate-attrs.js";
import noDuplicateClass from "./no-duplicate-class.js";
import noDuplicateId from "./no-duplicate-id.js";

export const groupARules: Record<string, RuleModule<any[]>> = {
  "attrs-newline": attrsNewline,
  "class-spacing": classSpacing,
  "css-no-empty-blocks": cssNoEmptyBlocks,
  "element-newline": elementNewline,
  "head-order": headOrder,
  "id-naming-convention": idNamingConvention,
  "indent": indent,
  "lowercase": lowercase,
  "max-element-depth": maxElementDepth,
  "no-abstract-roles": noAbstractRoles,
  "no-accesskey-attrs": noAccesskeyAttrs,
  "no-aria-hidden-body": noAriaHiddenBody,
  "no-aria-hidden-on-focusable": noAriaHiddenOnFocusable,
  "no-duplicate-attrs": noDuplicateAttrs,
  "no-duplicate-class": noDuplicateClass,
  "no-duplicate-id": noDuplicateId,
};
