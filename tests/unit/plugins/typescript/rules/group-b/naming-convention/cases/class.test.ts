// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/class.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: ['class % {}', 'abstract class % {}', 'const ignored = class % {}'],
    options: {
      selector: 'class',
    },
  },
]);
