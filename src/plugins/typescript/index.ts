// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/index.ts and src/raw-plugin.ts.
import type {
  ESLint,
  Rule,
} from "eslint";

import * as meta from "./meta.js";
import { groupARules } from "./rules/group-a.js";
import { groupBRules } from "./rules/group-b.js";
import { groupCRules } from "./rules/group-c.js";
import { groupDRules } from "./rules/group-d.js";
import { groupERules } from "./rules/group-e.js";
import { groupFRules } from "./rules/group-f.js";
import { groupGRules } from "./rules/group-g.js";
import { groupHRules } from "./rules/group-h.js";

/**
 * Our TypeScript plugin. It registers under the key `@typescript-eslint`, so
 * its rules keep their upstream names. It holds no configs: the typescript
 * preset sets the severities.
 */
const plugin: ESLint.Plugin = {
  meta,
  // The ported rule type differs from ESLint's, as upstream (a cast only).
  rules: {
    ...groupARules,
    ...groupBRules,
    ...groupCRules,
    ...groupDRules,
    ...groupERules,
    ...groupFRules,
    ...groupGRules,
    ...groupHRules,
  } as unknown as Record<string, Rule.RuleModule>,
};

export default plugin;
