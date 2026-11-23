// Ported from eslint-plugin-astro v3.2.1 (MIT), src/utils/index.ts.
import type {
  PartialRuleModule,
  RuleModule,
} from "../types.js";

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(
  ruleName: string,
  rule: PartialRuleModule,
): RuleModule {
  return {
    meta: {
      ...rule.meta,
      docs: {
        available: () => true,
        ...rule.meta.docs,
        url: `https://ota-meshi.github.io/eslint-plugin-astro/rules/${ruleName}/`,
        ruleId: `astro/${ruleName}`,
        ruleName,
      },
    },
    create: rule.create,
  };
}
