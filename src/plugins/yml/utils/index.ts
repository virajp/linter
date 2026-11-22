// Ported from eslint-plugin-yml v3.10.0 (MIT), src/utils/index.ts.
/* eslint @typescript-eslint/no-explicit-any: off -- util */
import type {
  PartialRuleModule,
  RuleContext,
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
        ...rule.meta.docs,
        url: `https://ota-meshi.github.io/eslint-plugin-yml/rules/${ruleName}.html`,
        ruleId: `yml/${ruleName}`,
        ruleName,
      },
    },
    create(context: RuleContext): any {
      return rule.create(context);
    },
  };
}
