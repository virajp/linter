// Ported from eslint-plugin-toml v1.5.0 (MIT), src/index.ts.
import type { ESLint } from "eslint";

import { TOMLLanguage } from "./language/index.js";
import * as meta from "./meta.js";
import { groupARules } from "./rules/group-a.js";
import { groupBRules } from "./rules/group-b.js";

/**
 * Our TOML plugin. It registers under the key `toml`, so its language is
 * `toml/toml`. It holds no configs: the toml preset sets the severities.
 */
const plugin: ESLint.Plugin = {
  meta,
  rules: { ...groupARules, ...groupBRules },
  languages: { toml: new TOMLLanguage() },
};

export default plugin;
