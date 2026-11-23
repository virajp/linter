// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/parameterProperty.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: [
      'class Ignored { constructor(private %) {} }',
      'class Ignored { constructor(readonly %) {} }',
      'class Ignored { constructor(private readonly %) {} }',
    ],
    options: {
      selector: 'parameterProperty',
    },
  },
  {
    code: ['class Ignored { constructor(private readonly %) {} }'],
    options: {
      modifiers: ['readonly'],
      selector: 'parameterProperty',
    },
  },
]);
