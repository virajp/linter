// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/naming-convention-utils/types.ts.
import type {
  TSESLint,
  TSESTree,
} from "@typescript-eslint/utils";

import type {
  IndividualAndMetaSelectorsString,
  MetaSelectors,
  Modifiers,
  ModifiersString,
  PredefinedFormats,
  PredefinedFormatsString,
  Selectors,
  SelectorsString,
  TypeModifiers,
  TypeModifiersString,
  UnderscoreOptions,
  UnderscoreOptionsString,
} from "./enums.js";

export type MessageIds =
  | "doesNotMatchFormat"
  | "doesNotMatchFormatTrimmed"
  | "missingAffix"
  | "missingUnderscore"
  | "satisfyCustom"
  | "unexpectedUnderscore";

// Note that this intentionally does not strictly type the modifiers/types properties.
// This is because doing so creates a huge headache, as the rule's code doesn't need to care.
// The JSON Schema strictly types these properties, so we know the user won't input invalid config.
export type Options = Selector[];

export interface MatchRegex {
  match: boolean;
  regex: string;
}

export interface Selector {
  custom?: MatchRegex;
  filter?: string | MatchRegex;
  // format options
  format: PredefinedFormatsString[] | null;
  leadingUnderscore?: UnderscoreOptionsString;
  modifiers?: ModifiersString[];
  prefix?: string[];
  // selector options
  selector: IndividualAndMetaSelectorsString | IndividualAndMetaSelectorsString[];
  suffix?: string[];
  trailingUnderscore?: UnderscoreOptionsString;
  types?: TypeModifiersString[];
}

export interface NormalizedMatchRegex {
  match: boolean;
  regex: RegExp;
}

export interface NormalizedSelector {
  custom: NormalizedMatchRegex | null;
  filter: NormalizedMatchRegex | null;
  // format options
  format: PredefinedFormats[] | null;
  leadingUnderscore: UnderscoreOptions | null;
  modifiers: Modifiers[] | null;
  // calculated ordering weight based on modifiers
  modifierWeight: number;
  prefix: string[] | null;
  // selector options
  selector: MetaSelectors | Selectors;
  suffix: string[] | null;
  trailingUnderscore: UnderscoreOptions | null;
  types: TypeModifiers[] | null;
}

export type ValidatorFunction = (
  node: TSESTree.Identifier | TSESTree.Literal | TSESTree.PrivateIdentifier,
  modifiers?: Set<Modifiers>,
) => void;
export type ParsedOptions = Record<SelectorsString, ValidatorFunction>;
export type Context = Readonly<TSESLint.RuleContext<MessageIds, Options>>;
