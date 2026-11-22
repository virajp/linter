import type { ESLint } from "eslint";

import { groupARules } from "./rules/group-a.js";
import { groupBRules } from "./rules/group-b.js";

export { tailwindSyntax } from "./syntax.js";

/**
 * Our Tailwind CSS plugin. It registers under the key `tailwindcss` and holds
 * rules only: the css preset sets the language, the syntax and the severities.
 */
const plugin: ESLint.Plugin = {
  meta: { name: "tailwindcss" },
  rules: { ...groupARules, ...groupBRules },
};

export default plugin;
