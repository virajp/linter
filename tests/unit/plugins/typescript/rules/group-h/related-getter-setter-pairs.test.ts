// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/related-getter-setter-pairs.test.ts.
import { afterAll, describe, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';
import rule from '../../../../../../src/plugins/typescript/rules/related-getter-setter-pairs.js';
import { createRuleTesterWithTypes } from '../../helpers/RuleTester.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('related-getter-setter-pairs', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
interface Example {
  get value(): string;
  set value(newValue: string);
}
    `,
    `
interface Example {
  get value(): string | undefined;
  set value();
}
    `,
    `
interface Example {
  get value(): string | undefined;
  set value(newValue: string, invalid: string);
}
    `,
    `
interface Example {
  get value(): string;
  set value(newValue: string | undefined);
}
    `,
    `
interface Example {
  get value(): number;
}
    `,
    `
interface Example {
  get value(): number;
  set value();
}
    `,
    `
interface Example {
  set value(newValue: string);
}
    `,
    `
interface Example {
  set value();
}
    `,
    `
type Example = {
  get value();
};
    `,
    `
type Example = {
  set value();
};
    `,
    `
class Example {
  get value() {
    return '';
  }
}
    `,
    `
class Example {
  get value() {
    return '';
  }
  set value() {}
}
    `,
    `
class Example {
  get value() {
    return '';
  }
  set value(param) {}
}
    `,
    `
class Example {
  get value() {
    return '';
  }
  set value(param: number) {}
}
    `,
    `
class Example {
  set value() {}
}
    `,
    `
type Example = {
  get value(): number;
  set value(newValue: number);
};
    `,
  ],

  invalid: [
    {
      code: `
interface Example {
  get value(): string | undefined;
  set value(newValue: string);
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'mismatch',
        },
      ],
    },
    {
      code: `
interface Example {
  get value(): number;
  set value(newValue: string);
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'mismatch',
        },
      ],
    },
    {
      code: `
type Example = {
  get value(): number;
  set value(newValue: string);
};
      `,
      errors: [
        {
          column: 16,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'mismatch',
        },
      ],
    },
    {
      code: `
class Example {
  get value(): boolean {
    return true;
  }
  set value(newValue: string) {}
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'mismatch',
        },
      ],
    },
    {
      code: `
type GetType = { a: string; b: string };

declare class Foo {
  get a(): GetType;

  set a(x: { c: string });
}
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'mismatch',
        },
      ],
    },
    {
      code: `
type GetType = { a: string; b: string };

type SetTypeUnused = { c: string };

declare class Foo {
  get a(): GetType;

  set a(x: { c: string });
}
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'mismatch',
        },
      ],
    },
    {
      code: `
type GetType = { a: string; b: string };

type SetType = { c: string };

declare class Foo {
  get a(): GetType;

  set a(x: SetType);
}
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'mismatch',
        },
      ],
    },
  ],
});
