// Ported from eslint-plugin-yml v3.10.0 (MIT), src/index.ts (rule registry, group B).
import type { RuleModule } from "../types.js";
import keyNameCasing from "./key-name-casing.js";
import keySpacing from "./key-spacing.js";
import maxLen from "./max-len.js";
import noBooleanKey from "./no-boolean-key.js";
import noEmptyDocument from "./no-empty-document.js";
import noEmptyKey from "./no-empty-key.js";
import noEmptyMappingValue from "./no-empty-mapping-value.js";
import noEmptySequenceEntry from "./no-empty-sequence-entry.js";
import noIrregularWhitespace from "./no-irregular-whitespace.js";
import noMultipleEmptyLines from "./no-multiple-empty-lines.js";

export const groupBRules: Record<string, RuleModule> = {
  "key-name-casing": keyNameCasing,
  "key-spacing": keySpacing,
  "max-len": maxLen,
  "no-boolean-key": noBooleanKey,
  "no-empty-document": noEmptyDocument,
  "no-empty-key": noEmptyKey,
  "no-empty-mapping-value": noEmptyMappingValue,
  "no-empty-sequence-entry": noEmptySequenceEntry,
  "no-irregular-whitespace": noIrregularWhitespace,
  "no-multiple-empty-lines": noMultipleEmptyLines,
};
