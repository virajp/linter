// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/rules/prefer-optional-chain-utils/PreferOptionalChainOptions.ts.
export type PreferOptionalChainMessageIds = "optionalChainSuggest" | "preferOptionalChain";

export interface PreferOptionalChainOptions {
  allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing?: boolean;
  checkAny?: boolean;
  checkBigInt?: boolean;
  checkBoolean?: boolean;
  checkNumber?: boolean;
  checkString?: boolean;
  checkUnknown?: boolean;
  requireNullish?: boolean;
}
