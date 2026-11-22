// Ported from eslint-plugin-yml v3.10.0 (MIT), src/index.ts (rule registry, group A).
import type { RuleModule } from "../types.js";
import blockMappingColonIndicatorNewline from "./block-mapping-colon-indicator-newline.js";
import blockMappingQuestionIndicatorNewline from "./block-mapping-question-indicator-newline.js";
import blockMapping from "./block-mapping.js";
import blockSequenceHyphenIndicatorNewline from "./block-sequence-hyphen-indicator-newline.js";
import blockSequence from "./block-sequence.js";
import fileExtension from "./file-extension.js";
import flowMappingCurlyNewline from "./flow-mapping-curly-newline.js";
import flowMappingCurlySpacing from "./flow-mapping-curly-spacing.js";
import flowSequenceBracketNewline from "./flow-sequence-bracket-newline.js";
import flowSequenceBracketSpacing from "./flow-sequence-bracket-spacing.js";
import indent from "./indent.js";

export const groupARules: Record<string, RuleModule> = {
  "block-mapping-colon-indicator-newline": blockMappingColonIndicatorNewline,
  "block-mapping-question-indicator-newline": blockMappingQuestionIndicatorNewline,
  "block-mapping": blockMapping,
  "block-sequence-hyphen-indicator-newline": blockSequenceHyphenIndicatorNewline,
  "block-sequence": blockSequence,
  "file-extension": fileExtension,
  "flow-mapping-curly-newline": flowMappingCurlyNewline,
  "flow-mapping-curly-spacing": flowMappingCurlySpacing,
  "flow-sequence-bracket-newline": flowSequenceBracketNewline,
  "flow-sequence-bracket-spacing": flowSequenceBracketSpacing,
  "indent": indent,
};
