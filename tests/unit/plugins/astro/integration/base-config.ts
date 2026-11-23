// The shape of upstream configs.base of eslint-plugin-astro v3.2.1 (MIT),
// built from our plugin: the astro preset entry with rules {}, plus the two
// client presets.
import type { Linter } from "eslint";
import {
  astroClientJsConfig,
  astroClientTsConfig,
} from "../../../../../src/config/presets/astro-client.js";
import { astroConfig } from "../../../../../src/config/presets/astro.js";

export const baseConfig: Linter.Config[] = [
  { ...astroConfig, rules: {} },
  astroClientJsConfig,
  astroClientTsConfig,
] as Linter.Config[];
