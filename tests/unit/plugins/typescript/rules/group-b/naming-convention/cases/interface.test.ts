// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/interface.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: ['interface % {}'],
    options: {
      selector: 'interface',
    },
  },
]);
