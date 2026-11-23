// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/integration/get-core-rule.ts.
import { builtinRules } from "eslint/use-at-your-own-risk";

/**
 * Get the core rule implementation from the rule name
 */
export function getCoreRule(ruleName: string): any {
  return builtinRules.get(ruleName);
}
