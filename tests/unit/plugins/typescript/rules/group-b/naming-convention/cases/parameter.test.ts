// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/parameter.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: [
      'function ignored(%) {}',
      '(function (%) {});',
      'declare function ignored(%);',
      'function ignored({%}) {}',
      'function ignored(...%) {}',
      'function ignored({% = 1}) {}',
      'function ignored({...%}) {}',
      'function ignored([%]) {}',
      'function ignored([% = 1]) {}',
      'function ignored([...%]) {}',
    ],
    options: {
      selector: 'parameter',
    },
  },
]);
