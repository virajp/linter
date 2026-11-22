// Ported from eslint-plugin-yml v3.10.0 (MIT), src/index.ts (rule registry, group C).
import type { RuleModule } from "../types.js";
import noTabIndent from "./no-tab-indent.js";
import noTrailingSpaces from "./no-trailing-spaces.js";
import noTrailingZeros from "./no-trailing-zeros.js";
import plainScalar from "./plain-scalar.js";
import quotes from "./quotes.js";
import requireStringKey from "./require-string-key.js";
import sortKeys from "./sort-keys.js";
import sortSequenceValues from "./sort-sequence-values.js";
import spacedComment from "./spaced-comment.js";

export const groupCRules: Record<string, RuleModule> = {
  "no-tab-indent": noTabIndent,
  "no-trailing-spaces": noTrailingSpaces,
  "no-trailing-zeros": noTrailingZeros,
  "plain-scalar": plainScalar,
  "quotes": quotes,
  "require-string-key": requireStringKey,
  "sort-keys": sortKeys,
  "sort-sequence-values": sortSequenceValues,
  "spaced-comment": spacedComment,
};
