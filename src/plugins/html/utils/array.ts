// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), lib/rules/utils/array.js.
export function find<T, S extends T>(
  items: T[],
  predicate: (node: T) => node is S,
): S | undefined {
  return items.find(predicate);
}

export function filter<T, S extends T>(
  items: T[],
  predicate: (node: T) => node is S,
): S[] {
  return items.filter(predicate);
}
