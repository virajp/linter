// Ported from eslint-plugin-astro v3.2.1 (MIT), tests/src/rules/no-unsafe-inline-scripts.ts.
import * as astroESLintParser from "astro-eslint-parser"
import type { ESLint, Rule } from "eslint"
import { RuleTester } from "eslint"
import { describe, it } from "vitest"
import {
  astroProcessor,
  clientSideTsProcessor,
} from "../../../../../../src/plugins/astro/processor/index.js"
import { groupBRules } from "../../../../../../src/plugins/astro/rules/group-b.js"
import { loadTestCases, unIndent } from "../../helpers/utils.js"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const plugin = {
  rules: groupBRules,
  processors: {
    "client-side-ts": clientSideTsProcessor,
    astro: astroProcessor,
    ".astro": astroProcessor,
  },
} as unknown as ESLint.Plugin

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-unsafe-inline-scripts",
  plugin.rules!["no-unsafe-inline-scripts"] as unknown as Rule.RuleModule,
  loadTestCases("no-unsafe-inline-scripts", plugin, {
    filter(file) {
      // Exclude define-vars-input.astro from valid tests since allowDefineVars defaults to false
      return (
        file.includes("/valid/") && !file.includes("define-vars-input.astro")
      )
    },
    additionals: {
      valid: [
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/valid/nonce-allowed.astro",
          code: unIndent`
            ---
            ---

            <script nonce="abc123">
              console.log('inline with nonce')
            </script>
          `,
          options: [{ allowNonce: true }],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/valid/module-allowed.astro",
          code: unIndent`
            ---
            ---

            <script type="module">
              console.log('inline module but allowed')
            </script>
          `,
          options: [{ allowModuleScripts: true }],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/valid/define-vars-allowed.astro",
          code: unIndent`
            ---
            const label = "Click"
            ---

            <button id="btn">{label}</button>
            <script define:vars={{ label }}>
              document.getElementById('btn')
                .addEventListener('click', () => console.log('clicked'))
            </script>
          `,
          options: [{ allowDefineVars: true }],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/valid/type-normalization.astro",
          code: unIndent`
            ---
            ---

            <script type="Application/LD+JSON; charset=utf-8">
              { "@context": "http://schema.org" }
            </script>
          `,
          options: [{ allowNonExecutingTypes: ["Application/LD+JSON"] }],
          languageOptions: { parser: astroESLintParser },
        },
      ],
      invalid: [
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/invalid/basic-inline-input.astro",
          code: unIndent`
            ---
            ---

            <button id="btn">Click</button>
            <script>
              document.getElementById('btn')
                .addEventListener('click', () => console.log('clicked'))
            </script>
          `,
          errors: [
            {
              messageId: "unexpected",
            },
          ],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/invalid/module-inline-input.astro",
          code: unIndent`
            ---
            ---

            <script type="module">
              console.log('module inline')
            </script>
          `,
          errors: [
            {
              messageId: "unexpected",
            },
          ],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/invalid/define-vars-default.astro",
          code: unIndent`
            ---
            const label = "Click"
            ---

            <button id="btn">{label}</button>
            <script define:vars={{ label }}>
              document.getElementById('btn')
                .addEventListener('click', () => console.log('clicked'))
            </script>
          `,
          errors: [
            {
              messageId: "unexpected",
            },
          ],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/invalid/define-vars-disallowed.astro",
          code: unIndent`
            ---
            const label = "Click"
            ---

            <button id="btn">{label}</button>
            <script define:vars={{ label }}>
              console.log(label)
            </script>
          `,
          options: [{ allowDefineVars: false }],
          errors: [
            {
              messageId: "unexpected",
            },
          ],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/invalid/json-ld-disallowed.astro",
          code: unIndent`
            ---
            ---

            <script type="application/ld+json">
              {JSON.stringify({"@context":"https://schema.org","@type":"Thing"})}
            </script>
          `,
          options: [{ allowNonExecutingTypes: [] }],
          errors: [
            {
              messageId: "unexpected",
            },
          ],
          languageOptions: { parser: astroESLintParser },
        },
        {
          filename:
            "tests/fixtures/rules/no-unsafe-inline-scripts/invalid/nonce-disallowed.astro",
          code: unIndent`
            ---
            ---

            <script nonce="abc123">
              console.log('inline with nonce')
            </script>
          `,
          // default allowNonce: false
          errors: [
            {
              messageId: "unexpected",
            },
          ],
          languageOptions: { parser: astroESLintParser },
        },
      ],
    },
  }),
)
