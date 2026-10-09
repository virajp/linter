import {
  describe,
  expect,
  test,
} from "vitest";
import { astroConfig } from "../../src/config/presets/astro.js";
import { cssConfig } from "../../src/config/presets/css.js";
import { htmlConfig } from "../../src/config/presets/html.js";
import { javascriptConfig } from "../../src/config/presets/javascript.js";
import { jsonConfig } from "../../src/config/presets/json.js";
import { jsoncConfig } from "../../src/config/presets/jsonc.js";
import { markdownCodeBlocksConfig } from "../../src/config/presets/markdown-code-blocks.js";
import { markdownConfig } from "../../src/config/presets/markdown.js";
import { tomlConfig } from "../../src/config/presets/toml.js";
import { typescriptConfig } from "../../src/config/presets/typescript.js";
import { yamlConfig } from "../../src/config/presets/yaml.js";

const presets = [
  { name: "astro", config: astroConfig, files: ["**/*.astro"] },
  { name: "css", config: cssConfig, files: ["**/*.css"] },
  { name: "html", config: htmlConfig, files: ["**/*.html"] },
  {
    name: "javascript",
    config: javascriptConfig,
    files: ["**/*.{js,mjs,cjs,jsx}"],
  },
  { name: "json", config: jsonConfig, files: ["**/*.json"] },
  {
    name: "jsonc",
    config: jsoncConfig,
    files: [
      "**/*.jsonc",
      "**/tsconfig.json",
      "**/tsconfig.*.json",
      "**/tsconfig-strict.json",
      "**/.vscode/*.json",
    ],
  },
  { name: "markdown", config: markdownConfig, files: ["**/*.md"] },
  {
    name: "markdown-code-blocks",
    config: markdownCodeBlocksConfig,
    files: ["**/*.md/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
  },
  { name: "toml", config: tomlConfig, files: ["**/*.toml"] },
  {
    name: "typescript",
    config: typescriptConfig,
    files: ["**/*.{ts,mts,cts,tsx}"],
  },
  { name: "yaml", config: yamlConfig, files: ["**/*.yaml", "**/*.yml"] },
];

for (const { name, config, files } of presets) {
  describe(`${name} preset`, () => {
    test("has correct name", () => {
      expect(config.name).toBe(name);
    });

    test("has correct files array", () => {
      expect(Array.isArray(config.files)).toBe(true);
      expect(config.files).toEqual(files);
    });

    test("has rules object", () => {
      expect(typeof config.rules).toBe("object");
      expect(config.rules).not.toBeNull();
    });
  });
}
