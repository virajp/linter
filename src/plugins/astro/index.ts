// Ported from eslint-plugin-astro v3.2.1 (MIT), src/plugin.ts.
import type {
  ESLint,
  Rule,
} from "eslint";

import { environments } from "./environments/index.js";
import * as meta from "./meta.js";
import {
  astroProcessor,
  clientSideTsProcessor,
} from "./processor/index.js";
import { groupARules } from "./rules/group-a.js";
import { groupBRules } from "./rules/group-b.js";

/**
 * Our Astro plugin. It registers under the key `astro`, so its processor is
 * `astro/client-side-ts`. It holds no configs: the astro preset sets the
 * severities.
 */
const plugin: ESLint.Plugin = {
  meta,
  // The ported rule type differs from ESLint's, as upstream (a cast only).
  rules: { ...groupARules, ...groupBRules } as unknown as Record<
    string,
    Rule.RuleModule
  >,
  processors: {
    ".astro": astroProcessor,
    "astro": astroProcessor,
    "client-side-ts": clientSideTsProcessor,
  },
  environments,
};

export default plugin;
