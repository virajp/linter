import type { Linter } from "eslint";
import { globalIgnores } from "eslint/config";
import type { LinterYamlRaw } from "./config-loader.js";
import baseConfig from "./eslint.config.js";

export interface LinterYamlOptions extends LinterYamlRaw {}

export function createConfig(
  options: LinterYamlOptions = {},
): Linter.Config[] {
  const configs: Linter.Config[] = [];

  if (options.ignores && options.ignores.length > 0) {
    configs.push(globalIgnores(options.ignores));
  }

  for (const base of baseConfig) {
    const clone: Linter.Config = { ...base };
    if (base.name && options.overrides?.[base.name]) {
      clone.rules = { ...base.rules, ...options.overrides[base.name].rules };
    }
    configs.push(clone);
  }

  if (options.configs) {
    configs.push(...(options.configs as Linter.Config[]));
  }

  return configs;
}

export default createConfig;
