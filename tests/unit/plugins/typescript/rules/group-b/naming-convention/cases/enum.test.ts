// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/enum.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: ['enum % {}'],
    options: {
      selector: 'enum',
    },
  },
]);
