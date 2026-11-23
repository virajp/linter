// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/createRule.ts.
import { ESLintUtils } from "@typescript-eslint/utils";

import type { ESLintPluginDocs } from "../rules-types.js";

export const createRule = ESLintUtils.RuleCreator<ESLintPluginDocs>(
  (name) => `https://typescript-eslint.io/rules/${name}`,
);
