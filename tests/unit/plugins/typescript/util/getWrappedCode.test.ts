// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/util/getWrappedCode.test.ts.
import { afterAll, describe, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';
import type { TSESTree } from '@typescript-eslint/utils';

import * as ts from 'typescript';

import {
  createRule,
  getOperatorPrecedence,
  getParserServices,
} from '../../../../../src/plugins/typescript/util/index.js';
import { getWrappedCode } from '../../../../../src/plugins/typescript/util/getWrappedCode.js';
import { createRuleTesterWithTypes } from '../helpers/RuleTester.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = createRuleTesterWithTypes();

const removeFunctionRule = createRule({
  create(context) {
    const parserServices = getParserServices(context, true);

    const report = (node: TSESTree.CallExpression): void => {
      context.report({
        fix: fixer => {
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
          const tsArgumentNode = tsNode.arguments[0];

          const nodePrecedence = getOperatorPrecedence(
            tsArgumentNode.kind,
            ts.isBinaryExpression(tsArgumentNode)
              ? tsArgumentNode.operatorToken.kind
              : ts.SyntaxKind.Unknown,
          );
          const parentPrecedence = getOperatorPrecedence(
            tsNode.parent.kind,
            ts.isBinaryExpression(tsNode.parent)
              ? tsNode.parent.operatorToken.kind
              : ts.SyntaxKind.Unknown,
          );

          const text = context.sourceCode.getText(node.arguments[0]);
          return fixer.replaceText(
            node,
            getWrappedCode(text, nodePrecedence, parentPrecedence),
          );
        },
        messageId: 'removeFunction',
        node,
      });
    };

    return {
      'CallExpression[callee.name="fn"]': report,
    };
  },
  meta: {
    docs: {
      description:
        'Remove function with first arg remaining in random places for test purposes.',
    },
    fixable: 'code',
    messages: {
      removeFunction: 'Please remove this function',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'remove-function',
});

ruleTester.run('getWrappedCode - removeFunctionRule', removeFunctionRule, {
  invalid: [
    // should add parens when the first argument node has lower precedence than the parent node of the CallExpression
    {
      code: '() => fn({ x: "wrapObject" })',
      errors: [{ messageId: 'removeFunction' }],
      output: '() => ({ x: "wrapObject" })',
    },

    // shouldn't add parens when not necessary
    {
      code: 'const a = fn({ x: "wrapObject" })',
      errors: [{ messageId: 'removeFunction' }],
      output: 'const a = { x: "wrapObject" }',
    },
  ],
  valid: [],
});
