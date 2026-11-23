// Ported from eslint-plugin-toml v1.5.0 (MIT), src/utils/rules.ts (rule registry, group A).
import type { RuleModule } from "../types.js";
import arrayBracketNewline from "./array-bracket-newline.js";
import arrayBracketSpacing from "./array-bracket-spacing.js";
import arrayElementNewline from "./array-element-newline.js";
import commaStyle from "./comma-style.js";
import indent from "./indent.js";
import inlineTableCurlyNewline from "./inline-table-curly-newline.js";
import inlineTableCurlySpacing from "./inline-table-curly-spacing.js";
import inlineTableKeyValueNewline from "./inline-table-key-value-newline.js";
import keySpacing from "./key-spacing.js";
import keysOrder from "./keys-order.js";
import noMixedTypeInArray from "./no-mixed-type-in-array.js";

export const groupARules: Record<string, RuleModule> = {
  "array-bracket-newline": arrayBracketNewline,
  "array-bracket-spacing": arrayBracketSpacing,
  "array-element-newline": arrayElementNewline,
  "comma-style": commaStyle,
  "indent": indent,
  "inline-table-curly-newline": inlineTableCurlyNewline,
  "inline-table-curly-spacing": inlineTableCurlySpacing,
  "inline-table-key-value-newline": inlineTableKeyValueNewline,
  "key-spacing": keySpacing,
  "keys-order": keysOrder,
  "no-mixed-type-in-array": noMixedTypeInArray,
};
