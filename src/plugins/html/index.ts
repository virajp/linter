// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/index.js.
import type {
  ESLint,
  Rule,
} from "eslint";

import { HTMLLanguage } from "./language/html-language.js";
import * as meta from "./meta.js";
import { groupARules } from "./rules/group-a.js";
import { groupBRules } from "./rules/group-b.js";
import { groupCRules } from "./rules/group-c.js";
import { groupDRules } from "./rules/group-d.js";

/**
 * Our HTML plugin. It registers under the key `html`, so its language is
 * `html/html`. It holds no configs: the html preset sets the severities.
 */
const plugin: ESLint.Plugin = {
  meta,
  // The ported rule type differs from ESLint's, as upstream (a cast only).
  rules: {
    ...groupARules,
    ...groupBRules,
    ...groupCRules,
    ...groupDRules,
  } as unknown as Record<string, Rule.RuleModule>,
  languages: { html: new HTMLLanguage() },
};

export default plugin;
