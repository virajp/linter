// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/getStringLength.ts.
let segmenter: Intl.Segmenter | undefined;

function isASCII(value: string): boolean {
  return /^[\u0020-\u007f]*$/u.test(value);
}

export function getStringLength(value: string): number {
  if (isASCII(value)) {
    return value.length;
  }

  segmenter ??= new Intl.Segmenter();

  return [...segmenter.segment(value)].length;
}
