// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/no-dupe-class-members.test.ts.
import { afterAll, describe, it } from 'vitest';
import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../../../../src/plugins/typescript/rules/no-dupe-class-members.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

ruleTester.run('no-dupe-class-members', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
class A {
  foo() {}
  bar() {}
}
    `,
    `
class A {
  static foo() {}
  foo() {}
}
    `,
    `
class A {
  get foo() {}
  set foo(value) {}
}
    `,
    `
class A {
  static foo() {}
  get foo() {}
  set foo(value) {}
}
    `,
    `
class A {
  foo() {}
}
class B {
  foo() {}
}
    `,
    `
class A {
  [foo]() {}
  foo() {}
}
    `,
    `
class A {
  foo() {}
  bar() {}
  baz() {}
}
    `,
    `
class A {
  *foo() {}
  *bar() {}
  *baz() {}
}
    `,
    `
class A {
  get foo() {}
  get bar() {}
  get baz() {}
}
    `,
    `
class A {
  1() {}
  2() {}
}
    `,
    `
class Foo {
  foo(a: string): string;
  foo(a: number): number;
  foo(a: any): any {}
}
    `,
  ],
  invalid: [
    {
      code: `
class A {
  foo() {}
  foo() {}
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
!class A {
  foo() {}
  foo() {}
};
      `,
      errors: [
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: noFormat`
class A {
  'foo'() {}
  'foo'() {}
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class A {
  10() {}
  1e1() {}
}
      `,
      errors: [
        {
          column: 3,
          data: { name: '10' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    // Verify multiple instances of error
    /* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors */
    {
      code: `
class A {
  foo() {}
  foo() {}
  foo() {}
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 6,
          endLine: 5,
          line: 5,
          messageId: 'unexpected',
        },
      ],
    },
    /* eslint-enable @typescript-eslint/internal/no-multiple-lines-of-errors */
    {
      code: `
class A {
  static foo() {}
  static foo() {}
}
      `,
      errors: [
        {
          column: 10,
          data: { name: 'foo' },
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class A {
  foo() {}
  get foo() {}
}
      `,
      errors: [
        {
          column: 7,
          data: { name: 'foo' },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class A {
  set foo(value) {}
  foo() {}
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class A {
  foo;
  foo = 42;
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
    {
      code: `
class A {
  foo;
  foo() {}
}
      `,
      errors: [
        {
          column: 3,
          data: { name: 'foo' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'unexpected',
        },
      ],
    },
  ],
});
