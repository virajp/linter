// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), rules.d.ts.
import type {
  RuleModuleWithMetaDocs,
  RuleRecommendation,
  RuleRecommendationAcrossConfigs,
} from "@typescript-eslint/utils/ts-eslint";

export interface ESLintPluginDocs {
  /**
   * Does the rule extend (or is it based off of) an ESLint code rule?
   * Alternately accepts the name of the base rule, in case the rule has been renamed.
   * This is only used for documentation purposes.
   */
  extendsBaseRule?: boolean | string;

  /**
   * If a string config name, which starting config this rule is enabled in.
   * If an object, which settings it has enabled in each of those configs.
   */
  recommended?: RuleRecommendation | RuleRecommendationAcrossConfigs<unknown[]>;

  /**
   * Does the rule require us to create a full TypeScript Program in order for it
   * to type-check code. This is only used for documentation purposes.
   */
  requiresTypeChecking?: boolean;
}

export type ESLintPluginRuleModule = RuleModuleWithMetaDocs<
  string,
  readonly unknown[],
  ESLintPluginDocs
>;

export type TypeScriptESLintRules = Record<
  string,
  RuleModuleWithMetaDocs<string, unknown[], ESLintPluginDocs>
>;
