import { defineConfig } from "eslint/config";
import { ignores } from "./ignores.js";
import { astroConfig } from "./presets/astro.js";
import { cssConfig } from "./presets/css.js";
import { htmlConfig } from "./presets/html.js";
import { javascriptConfig } from "./presets/javascript.js";
import { jsonConfig } from "./presets/json.js";
import { jsoncConfig } from "./presets/jsonc.js";
import { markdownCodeBlocksConfig } from "./presets/markdown-code-blocks.js";
import { markdownConfig } from "./presets/markdown.js";
import { tomlConfig } from "./presets/toml.js";
import { typescriptConfig } from "./presets/typescript.js";
import { yamlConfig } from "./presets/yaml.js";

export function composeBaseConfig() {
  return defineConfig([
    ignores,
    javascriptConfig,
    typescriptConfig,
    astroConfig,
    jsonConfig,
    jsoncConfig,
    markdownConfig,
    markdownCodeBlocksConfig,
    yamlConfig,
    tomlConfig,
    htmlConfig,
    cssConfig,
  ]);
}
