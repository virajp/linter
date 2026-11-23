// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/rules/no-unused-vars/no-unused-vars-enableAutofixRemoval.test.ts.
import { afterAll, describe, it } from 'vitest';
import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../../../../../src/plugins/typescript/rules/no-unused-vars.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {},
      ecmaVersion: 6,
      sourceType: 'module',
    },
  },
});

describe('no-unused-vars', () => {
  ruleTester.run('enableAutofixRemoval.imports = true', rule, {
    assertionOptions: {
      requireData: true,
    },
    valid: [],
    invalid: [
      {
        code: `
import * as Unused from 'module';
export {};
        `,
        errors: [
          {
            column: 13,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 19,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import Unused from 'module';
export {};
        `,
        errors: [
          {
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import { Unused } from 'module';
export {};
        `,
        errors: [
          {
            column: 10,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 16,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import { Unused, Unused2 } from 'module';
export {};
        `,
        errors: [
          {
            column: 10,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 16,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 18,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 25,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import { Unused, Used } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 10,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 16,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import {  Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Used, Unused } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used } from 'module';
export { Used };
        `,
      },
      {
        code: noFormat`
import { Used, Unused, } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used, } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Used, Unused, Used2 } from 'module';
export { Used, Used2 };
        `,
        errors: [
          {
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used, Used2 } from 'module';
export { Used, Used2 };
        `,
      },
      {
        code: `
import Unused, { Unused2 } from 'module';
export {};
        `,
        errors: [
          {
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 18,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 25,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
export {};
        `,
      },
      {
        code: `
import Unused, { Used } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import  { Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import Used, { Unused } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used from 'module';
export { Used };
        `,
      },
      {
        code: noFormat`
import Used, { Unused, } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used from 'module';
export { Used };
        `,
      },
      {
        code: `
import Used, { Used2, Unused } from 'module';
export { Used, Used2 };
        `,
        errors: [
          {
            column: 23,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 29,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used, { Used2 } from 'module';
export { Used, Used2 };
        `,
      },
      {
        code: `
import Used, { Unused, Used2 } from 'module';
export { Used, Used2 };
        `,
        errors: [
          {
            column: 16,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 22,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import Used, {  Used2 } from 'module';
export { Used, Used2 };
        `,
      },
      {
        code: `
import Unused, { Unused2, Used } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 18,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 25,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import  {  Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import Unused, { Used, Unused2 } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
          {
            column: 24,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused2',
            },
            endColumn: 31,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import  { Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Unused as Unused1, Used } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 20,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            endColumn: 27,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import {  Used } from 'module';
export { Used };
        `,
      },
      {
        code: `
import { Used, Unused as Unused1 } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 26,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            endColumn: 33,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used } from 'module';
export { Used };
        `,
      },
      {
        code: noFormat`
import { Used, Unused as Unused1, } from 'module';
export { Used };
        `,
        errors: [
          {
            column: 26,
            data: {
              action: 'defined',
              additional: '',
              varName: 'Unused1',
            },
            endColumn: 33,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
import { Used, } from 'module';
export { Used };
        `,
      },
      {
        code: `
/* this is an important comment */ import assert from 'assert';
        `,
        errors: [
          {
            column: 43,
            data: {
              action: 'defined',
              additional: '',
              varName: 'assert',
            },
            endColumn: 49,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
/* this is an important comment */\u0020
        `,
      },
      {
        code: `
import assert from 'assert'; /* this is an important comment */
        `,
        errors: [
          {
            column: 8,
            data: {
              action: 'defined',
              additional: '',
              varName: 'assert',
            },
            endColumn: 14,
            endLine: 2,
            line: 2,
            messageId: 'unusedVar',
          },
        ],
        options: [
          {
            enableAutofixRemoval: {
              imports: true,
            },
          },
        ],
        output: `
 /* this is an important comment */
        `,
      },
    ],
  });
});
