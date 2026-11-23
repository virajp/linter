// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/no-import-type-side-effects.test.ts.
import { afterAll, describe, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../../../../src/plugins/typescript/rules/no-import-type-side-effects.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run('no-import-type-side-effects', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    "import T from 'mod';",
    "import * as T from 'mod';",
    "import { T } from 'mod';",
    "import type { T } from 'mod';",
    "import type { T, U } from 'mod';",
    "import { type T, U } from 'mod';",
    "import { T, type U } from 'mod';",
    "import type T from 'mod';",
    "import T, { type U } from 'mod';",
    "import type * as T from 'mod';",
    "import 'mod';",
  ],
  invalid: [
    {
      code: "import { type A } from 'mod';",
      errors: [
        {
          column: 1,
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'useTopLevelQualifier',
        },
      ],
      output: "import type { A } from 'mod';",
    },
    {
      code: "import { type A as AA } from 'mod';",
      errors: [
        {
          column: 1,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'useTopLevelQualifier',
        },
      ],
      output: "import type { A as AA } from 'mod';",
    },
    {
      code: "import { type A, type B } from 'mod';",
      errors: [
        {
          column: 1,
          endColumn: 38,
          endLine: 1,
          line: 1,
          messageId: 'useTopLevelQualifier',
        },
      ],
      output: "import type { A, B } from 'mod';",
    },
    {
      code: "import { type A as AA, type B as BB } from 'mod';",
      errors: [
        {
          column: 1,
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'useTopLevelQualifier',
        },
      ],
      output: "import type { A as AA, B as BB } from 'mod';",
    },
  ],
});
