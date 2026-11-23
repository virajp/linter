// Ported from @typescript-eslint/eslint-plugin v8.73.0 (MIT), tests/RuleTester.ts.
import type { ParserOptions } from '@typescript-eslint/utils/ts-eslint';

import { RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function createRuleTesterWithTypes(
  providedParserOptions: ParserOptions | undefined = {},
): RuleTester {
  const parserOptions = {
    ...providedParserOptions,
    tsconfigRootDir:
      providedParserOptions.tsconfigRootDir ?? getFixturesRootDir(),
  };

  // If the test has requested a specific project, disable projectService.
  // Otherwise, default to using projectService for types
  // See: https://github.com/typescript-eslint/typescript-eslint/issues/11676
  parserOptions.projectService ??= !parserOptions.project;

  return new RuleTester({
    languageOptions: { parserOptions },
  });
}

export function getFixturesRootDir(): string {
  return path.join(dirname, '..', 'fixtures');
}
