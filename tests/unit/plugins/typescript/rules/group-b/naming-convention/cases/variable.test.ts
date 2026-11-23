// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/variable.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: [
      'const % = 1;',
      'let % = 1;',
      'var % = 1;',
      'const {%} = {ignored: 1};',
      'const {% = 2} = {ignored: 1};',
      'const {...%} = {ignored: 1};',
      'const [%] = [1];',
      'const [% = 1] = [1];',
      'const [...%] = [1];',
    ],
    options: {
      selector: 'variable',
    },
  },
]);
