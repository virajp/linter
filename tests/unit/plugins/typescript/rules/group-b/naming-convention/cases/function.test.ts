// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/function.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: ['function % () {}', '(function % () {});', 'declare function % ();'],
    options: {
      selector: 'function',
    },
  },
]);
