// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), src/util/types.ts.
export type MakeRequired<Base, Key extends keyof Base> =
  & Omit<Base, Key>
  & Required<Record<Key, NonNullable<Base[Key]>>>;

export type ValueOf<T> = T[keyof T];
