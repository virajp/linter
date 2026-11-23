// Ported from eslint-plugin-astro v3.2.1 (MIT), src/rules/index.ts (rule registry, group A).
import type { RuleModule } from "../types.js";
import missingClientOnlyDirectiveValue from "./missing-client-only-directive-value.js";
import noConflictSetDirectives from "./no-conflict-set-directives.js";
import noDeprecatedAstroCanonicalurl from "./no-deprecated-astro-canonicalurl.js";
import noDeprecatedAstroFetchcontent from "./no-deprecated-astro-fetchcontent.js";
import noDeprecatedAstroResolve from "./no-deprecated-astro-resolve.js";
import noDeprecatedGetentrybyslug from "./no-deprecated-getentrybyslug.js";
import noExportsFromComponents from "./no-exports-from-components.js";
import noPrerenderExportOutsidePages from "./no-prerender-export-outside-pages.js";
import noSetHtmlDirective from "./no-set-html-directive.js";

export const groupARules: Record<string, RuleModule> = {
  "missing-client-only-directive-value": missingClientOnlyDirectiveValue,
  "no-conflict-set-directives": noConflictSetDirectives,
  "no-deprecated-astro-canonicalurl": noDeprecatedAstroCanonicalurl,
  "no-deprecated-astro-fetchcontent": noDeprecatedAstroFetchcontent,
  "no-deprecated-astro-resolve": noDeprecatedAstroResolve,
  "no-deprecated-getentrybyslug": noDeprecatedGetentrybyslug,
  "no-exports-from-components": noExportsFromComponents,
  "no-prerender-export-outside-pages": noPrerenderExportOutsidePages,
  "no-set-html-directive": noSetHtmlDirective,
};
