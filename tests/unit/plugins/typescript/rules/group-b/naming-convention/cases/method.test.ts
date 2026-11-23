// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/naming-convention/cases/method.test.ts.
import { createTestCases } from './createTestCases.js';

createTestCases([
  {
    code: [
      'class Ignored { private %() {} }',
      'class Ignored { private "%"() {} }',
      'class Ignored { private async %() {} }',
      'class Ignored { private static %() {} }',
      'class Ignored { private static async %() {} }',
      'class Ignored { private % = () => {} }',
      'class Ignored { abstract %() }',
      'class Ignored { #%() }',
      'class Ignored { static #%() }',
    ],
    options: {
      selector: 'classMethod',
    },
  },
  {
    code: [
      'const ignored = { %() {} };',
      'const ignored = { "%"() {} };',
      'const ignored = { %: () => {} };',
    ],
    options: {
      selector: 'objectLiteralMethod',
    },
  },
  {
    code: [
      'interface Ignored { %(): string }',
      'interface Ignored { "%"(): string }',
      'interface Ignored { %: () => string }',
      'interface Ignored { "%": () => string }',
      'type Ignored = { %(): string }',
      'type Ignored = { "%"(): string }',
      'type Ignored = { %: () => string }',
      'type Ignored = { "%": () => string }',
    ],
    options: {
      selector: 'typeMethod',
    },
  },
]);
