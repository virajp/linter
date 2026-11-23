// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/index.js (rule registry, group D).
import type { RuleModule } from "../types/index.js";
import requireDetailsSummary from "./require-details-summary.js";
import requireDoctype from "./require-doctype.js";
import requireExplicitSize from "./require-explicit-size.js";
import requireFormMethod from "./require-form-method.js";
import requireFrameTitle from "./require-frame-title.js";
import requireImgAlt from "./require-img-alt.js";
import requireInputLabel from "./require-input-label.js";
import requireLang from "./require-lang.js";
import requireLiContainer from "./require-li-container.js";
import requireMetaCharset from "./require-meta-charset.js";
import requireMetaDescription from "./require-meta-description.js";
import requireMetaViewport from "./require-meta-viewport.js";
import requireOpenGraphProtocol from "./require-open-graph-protocol.js";
import requireTitle from "./require-title.js";
import sortAttrs from "./sort-attrs.js";
import svgRequireViewbox from "./svg-require-viewbox.js";
import useBaseline from "./use-baseline.js";

export const groupDRules: Record<string, RuleModule<any[]>> = {
  "require-details-summary": requireDetailsSummary,
  "require-doctype": requireDoctype,
  "require-explicit-size": requireExplicitSize,
  "require-form-method": requireFormMethod,
  "require-frame-title": requireFrameTitle,
  "require-img-alt": requireImgAlt,
  "require-input-label": requireInputLabel,
  "require-lang": requireLang,
  "require-li-container": requireLiContainer,
  "require-meta-charset": requireMetaCharset,
  "require-meta-description": requireMetaDescription,
  "require-meta-viewport": requireMetaViewport,
  "require-open-graph-protocol": requireOpenGraphProtocol,
  "require-title": requireTitle,
  "sort-attrs": sortAttrs,
  "svg-require-viewbox": svgRequireViewbox,
  "use-baseline": useBaseline,
};
