// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/typeAlias.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: ['type % = {};', 'type % = 1;'],
    options: {
      selector: 'typeAlias',
    },
  },
]);
