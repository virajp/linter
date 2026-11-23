// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/lazyRules.ts.
import type { ESLintPluginRuleModule } from "../rules-types.js";

type Loader = () => { default: ESLintPluginRuleModule };

export function lazyRules<T extends Record<string, Loader>>(
  loaders: T,
): Record<keyof T, ESLintPluginRuleModule> {
  const rules = {} as Record<keyof T, ESLintPluginRuleModule>;

  for (const [name, load] of Object.entries(loaders)) {
    let rule: ESLintPluginRuleModule | undefined;

    Object.defineProperty(rules, name, {
      enumerable: true,
      get: () => {
        rule ??= load().default;

        return rule;
      },
    });
  }

  return rules;
}
