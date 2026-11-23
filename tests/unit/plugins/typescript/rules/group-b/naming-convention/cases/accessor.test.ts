// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/accessor.test.ts.
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
        'const ignored = { get %() {} };',
        'const ignored = { set "%"(ignored) {} };',
        'class Ignored { private get %() {} }',
        'class Ignored { private set "%"(ignored) {} }',
        'class Ignored { private static get %() {} }',
        'class Ignored { static get #%() {} }',
      ],
      options: {
        selector: 'accessor',
      },
    },
  ],
  // `accessor` keyword requires TS 4.9
  {
    typescript: '4.9',
  },
);
