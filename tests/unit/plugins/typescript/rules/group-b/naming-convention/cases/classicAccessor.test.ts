// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/classicAccessor.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: [
      'const ignored = { get %() {} };',
      'const ignored = { set "%"(ignored) {} };',
      'class Ignored { private get %() {} }',
      'class Ignored { private set "%"(ignored) {} }',
      'class Ignored { private static get %() {} }',
      'class Ignored { static get #%() {} }',
      'abstract class Ignored { abstract get %(): number }',
      'abstract class Ignored { abstract set %(ignored: number) }',
    ],
    options: {
      selector: 'classicAccessor',
    },
  },
]);
