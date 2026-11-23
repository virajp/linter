// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/util/isConditionalTest.test.ts.
import { describe, expect, it } from 'vitest';
import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isConditionalTest } from '../../../../../src/plugins/typescript/util/isConditionalTest.js';

describe(isConditionalTest, () => {
  it('returns false for nodes with no parent', () => {
    const node = {
      name: 'value',
      type: AST_NODE_TYPES.Identifier,
    } as TSESTree.Identifier;

    expect(isConditionalTest(node)).toBe(false);
  });
});
