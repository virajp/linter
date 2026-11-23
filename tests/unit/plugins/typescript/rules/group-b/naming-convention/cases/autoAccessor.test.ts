// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/autoAccessor.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases(
  [
    {
      code: [
        'class Ignored { accessor % = 10; }',
        'class Ignored { accessor #% = 10; }',
        'class Ignored { static accessor % = 10; }',
        'class Ignored { static accessor #% = 10; }',
        'class Ignored { private accessor % = 10; }',
        'class Ignored { private static accessor % = 10; }',
        'class Ignored { override accessor % = 10; }',
        'class Ignored { accessor "%" = 10; }',
        'class Ignored { protected accessor % = 10; }',
        'class Ignored { public accessor % = 10; }',
        'class Ignored { abstract accessor %; }',
      ],
      options: {
        selector: 'autoAccessor',
      },
    },
  ],
  // `accessor` keyword requires TS 4.9
  {
    typescript: '4.9',
  },
);
