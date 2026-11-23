// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/no-unsafe-declaration-merging.test.ts.
import { afterAll, describe, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';

/* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors -- The rule naturally makes multiple errors */
import rule from '../../../../../../src/plugins/typescript/rules/no-unsafe-declaration-merging.js';
import { createRuleTesterWithTypes } from '../../helpers/RuleTester.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unsafe-declaration-merging', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
interface Foo {}
class Bar implements Foo {}
    `,
    `
namespace Foo {}
namespace Foo {}
    `,
    `
enum Foo {}
namespace Foo {}
    `,
    `
namespace Fooo {}
function Foo() {}
    `,
    `
const Foo = class {};
    `,
    `
interface Foo {
  props: string;
}

function bar() {
  return class Foo {};
}
    `,
    `
interface Foo {
  props: string;
}

(function bar() {
  class Foo {}
})();
    `,
    `
declare global {
  interface Foo {}
}

class Foo {}
    `,
  ],
  invalid: [
    {
      code: `
interface Foo {}
class Foo {}
      `,
      errors: [
        {
          column: 11,
          endColumn: 14,
          endLine: 2,
          line: 2,
          messageId: 'unsafeMerging',
        },
        {
          column: 7,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'unsafeMerging',
        },
      ],
    },
    {
      code: `
class Foo {}
interface Foo {}
      `,
      errors: [
        {
          column: 7,
          endColumn: 10,
          endLine: 2,
          line: 2,
          messageId: 'unsafeMerging',
        },
        {
          column: 11,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'unsafeMerging',
        },
      ],
    },
    {
      code: `
declare global {
  interface Foo {}
  class Foo {}
}
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'unsafeMerging',
        },
        {
          column: 9,
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'unsafeMerging',
        },
      ],
    },
  ],
});
