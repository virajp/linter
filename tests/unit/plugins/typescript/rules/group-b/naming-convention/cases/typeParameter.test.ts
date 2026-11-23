// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/typeParameter.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: [
      'class Ignored<%> {}',
      'function ignored<%>() {}',
      'type Ignored<%> = { ignored: % };',
      'interface Ignored<%> extends Ignored<string> {}',
    ],
    options: {
      selector: 'typeParameter',
    },
  },
]);
