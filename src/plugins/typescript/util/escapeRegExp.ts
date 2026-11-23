// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/escapeRegExp.ts.
/**
 * Lodash <https://lodash.com/>
 * Released under MIT license <https://lodash.com/license>
 */
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);

export function escapeRegExp(string = ""): string {
  return string && reHasRegExpChar.test(string)
    ? string.replaceAll(reRegExpChar, "\\$&")
    : string;
}
