// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/util/lazyRules.test.ts.
import { describe, expect, it, vi } from 'vitest';
import { lazyRules } from '../../../../../src/plugins/typescript/util/lazyRules.js';

describe(lazyRules, () => {
  const ruleA = { create: () => ({}) } as never;
  const ruleB = { create: () => ({}) } as never;

  it('does not load any rule when created or enumerated', () => {
    const loadA = vi.fn(() => ({ default: ruleA }));
    const loadB = vi.fn(() => ({ default: ruleB }));

    const rules = lazyRules({ a: loadA, b: loadB });

    expect(Object.keys(rules)).toStrictEqual(['a', 'b']);

    expect(loadA).not.toHaveBeenCalled();
    expect(loadB).not.toHaveBeenCalled();
  });

  it('loads only the accessed rule and returns its default export', () => {
    const loadA = vi.fn(() => ({ default: ruleA }));
    const loadB = vi.fn(() => ({ default: ruleB }));

    const rules = lazyRules({ a: loadA, b: loadB });

    expect(rules.a).toBe(ruleA);

    expect(loadA).toHaveBeenCalledOnce();
    expect(loadB).not.toHaveBeenCalled();
  });

  it('loads a rule only once across repeated accesses', () => {
    const loadA = vi.fn(() => ({ default: ruleA }));

    const rules = lazyRules({ a: loadA });

    expect(rules.a).toBe(ruleA);
    expect(rules.a).toBe(ruleA);

    expect(loadA).toHaveBeenCalledOnce();
  });
});
