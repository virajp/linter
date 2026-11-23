// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/prefer-namespace-keyword.test.ts.
import { afterAll, describe, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../../../../src/plugins/typescript/rules/prefer-namespace-keyword.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;


const ruleTester = new RuleTester();

ruleTester.run('prefer-namespace-keyword', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    "declare module 'foo';",
    "declare module 'foo' {}",
    'namespace foo {}',
    'declare namespace foo {}',
    'declare global {}',
  ],
  invalid: [
    {
      code: 'module foo {}',
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'useNamespace',
        },
      ],
      output: 'namespace foo {}',
    },
    {
      code: 'declare module foo {}',
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'useNamespace',
        },
      ],
      output: 'declare namespace foo {}',
    },
    {
      code: `
declare module foo {
  declare namespace bar {}
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'useNamespace',
        },
      ],
      output: `
declare namespace foo {
  declare namespace bar {}
}
      `,
    },
    {
      code: `
declare namespace foo {
  declare module bar {}
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'useNamespace',
        },
      ],
      output: `
declare namespace foo {
  declare namespace bar {}
}
      `,
    },
  ],
});
