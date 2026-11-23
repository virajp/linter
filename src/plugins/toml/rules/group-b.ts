// Ported from eslint-plugin-toml v1.5.0 (MIT), src/utils/rules.ts (rule registry, group B).
import type { RuleModule } from "../types.js";
import noNonDecimalInteger from "./no-non-decimal-integer.js";
import noSpaceDots from "./no-space-dots.js";
import noUnreadableNumberSeparator from "./no-unreadable-number-separator.js";
import paddingLineBetweenPairs from "./padding-line-between-pairs.js";
import paddingLineBetweenTables from "./padding-line-between-tables.js";
import precisionOfFractionalSeconds from "./precision-of-fractional-seconds.js";
import precisionOfInteger from "./precision-of-integer.js";
import quotedKeys from "./quoted-keys.js";
import spacedComment from "./spaced-comment.js";
import tableBracketSpacing from "./table-bracket-spacing.js";
import tablesOrder from "./tables-order.js";

export const groupBRules: Record<string, RuleModule> = {
  "no-non-decimal-integer": noNonDecimalInteger,
  "no-space-dots": noSpaceDots,
  "no-unreadable-number-separator": noUnreadableNumberSeparator,
  "padding-line-between-pairs": paddingLineBetweenPairs,
  "padding-line-between-tables": paddingLineBetweenTables,
  "precision-of-fractional-seconds": precisionOfFractionalSeconds,
  "precision-of-integer": precisionOfInteger,
  "quoted-keys": quotedKeys,
  "spaced-comment": spacedComment,
  "table-bracket-spacing": tableBracketSpacing,
  "tables-order": tablesOrder,
};
