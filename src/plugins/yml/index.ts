// Ported from eslint-plugin-yml v3.10.0 (MIT), src/index.ts.
import type { ESLint } from "eslint";

import { YAMLLanguage } from "./language/index.js";
import * as meta from "./meta.js";
import { groupARules } from "./rules/group-a.js";
import { groupBRules } from "./rules/group-b.js";
import { groupCRules } from "./rules/group-c.js";

/**
 * Our YAML plugin. It registers under the key `yml`, so its language is
 * `yml/yaml`. It holds no configs: the yaml preset sets the severities.
 */
const plugin: ESLint.Plugin = {
  meta,
  rules: { ...groupARules, ...groupBRules, ...groupCRules },
  languages: { yaml: new YAMLLanguage() },
};

export default plugin;
