// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/rules/use-baseline.test.js.
import type { ESLint } from "eslint";
import { HTMLLanguage } from "../../../../../../src/plugins/html/language/html-language.js";
import { groupDRules } from "../../../../../../src/plugins/html/rules/group-d.js";
import rule from "../../../../../../src/plugins/html/rules/use-baseline.js";
import { createRuleTester } from "../../helpers/rule-tester.js";

const plugin = {
  rules: groupDRules,
  languages: { html: new HTMLLanguage() },
} as unknown as ESLint.Plugin;

const ruleTester = createRuleTester(plugin);
const templateRuleTester = createRuleTester(plugin, "espree");

ruleTester.run("use-baseline", rule, {
  valid: [
    {
      code: `<slot></slot>`,
    },
    {
      code: `<div id="foo"></div>`,
    },
    {
      code: `<svg></svg>`,
    },
    {
      code: `<custom-element popovertarget="mypopover"></custom-element>`,
    },
    {
      code: `<meta http-equiv="refresh" content="5">`,
    },
    {
      code: `<script type="module"></script>`,
    },
    {
      code: `<slot></slot>`,
      options: [
        {
          available: "widely",
        },
      ],
    },
    {
      code: `<button popovertarget="mypopover" popovertargetaction="show"></button>`,
      options: [
        {
          available: "newly",
        },
      ],
    },
    {
      code: `<input type="number"></input>`,
    },
    {
      code: `<input type="unknown"></input>`,
    },
    {
      code: `<input type="tel"></input>`,
    },
    {
      code: `<a href="https://html-eslint.org"></a>`,
    },
    {
      code: `<td></td>`,
    },
    {
      code: `<td rowspan="1"></td>`,
    },
    {
      code: `<th rowspan="2"></th>`,
    },
  ],
  invalid: [
    {
      code: `<slot></slot>`,
      errors: [
        {
          message: "Element '<slot>' is not a 2001 available baseline feature.",
          column: 1,
          endColumn: 14,
          line: 1,
        },
      ],
      options: [
        {
          available: 2001,
        },
      ],
    },
    {
      code: `<SLOT></SLOT>`,
      errors: [
        {
          message: "Element '<slot>' is not a 2001 available baseline feature.",
          column: 1,
          endColumn: 14,
          line: 1,
        },
      ],
      options: [
        {
          available: 2001,
        },
      ],
    },
    {
      code: `<span slot="username">Jane Doe</span>`,
      errors: [
        {
          message: "Attribute 'slot' is not a 2019 available baseline feature.",
        },
      ],
      options: [
        {
          available: 2019,
        },
      ],
    },
    {
      code: `<button command="show-modal" commandfor="mydialog"></button>`,
      errors: [
        {
          messageId: "notBaselineElementAttribute",
        },
        {
          messageId: "notBaselineElementAttribute",
        },
      ],
      options: [
        {
          available: "widely",
        },
      ],
    },
    {
      code: `<div contenteditable="plaintext-only"></div>`,
      errors: [
        {
          message:
            "Attribute 'contenteditable=\"plaintext-only\"' is not a widely available baseline feature.",
          column: 23,
          endColumn: 37,
          line: 1,
        },
      ],
    },
    {
      // upper case
      code: `<div contenteditable="PLAINTEXT-ONLY"></div>`,
      errors: [
        {
          message:
            "Attribute 'contenteditable=\"PLAINTEXT-ONLY\"' is not a widely available baseline feature.",
          column: 23,
          endColumn: 37,
          line: 1,
        },
      ],
    },
    {
      // trailing space
      code: `<div contenteditable="PLAINTEXT-ONLY "></div>`,
      errors: [
        {
          message:
            "Attribute 'contenteditable=\"PLAINTEXT-ONLY \"' is not a widely available baseline feature.",
          column: 23,
          endColumn: 38,
          line: 1,
        },
      ],
    },
    {
      code: `<script type="module"></script>`,
      errors: [
        {
          message:
            "Attribute 'type=\"module\"' on '<script>' is not a 2017 available baseline feature.",
          column: 15,
          endColumn: 21,
        },
      ],
      options: [
        {
          available: 2017,
        },
      ],
    },
    {
      code: `<style blocking="render"></style>`,
      errors: [
        {
          message:
            "Attribute 'blocking' on '<style>' is not a widely available baseline feature.",
          column: 8,
          endColumn: 16,
        },
      ],
      options: [
        {
          available: "widely",
        },
      ],
    },
    {
      code: `<input type="week"></input>`,
      errors: [
        {
          message:
            "Attribute 'type=\"week\"' on '<input>' is not a widely available baseline feature.",
          column: 14,
          endColumn: 18,
        },
      ],
    },
    {
      code: `<a href="sms:00000"></a>`,
      errors: [
        {
          message:
            "Attribute 'href=\"sms:00000\"' on '<a>' is not a widely available baseline feature.",
          column: 10,
          endColumn: 19,
        },
      ],
    },
    {
      code: `<td rowspan="0"></td>`,
      errors: [
        {
          message:
            "Attribute 'rowspan=\"0\"' on '<td>' is not a widely available baseline feature.",
          column: 14,
          endColumn: 15,
        },
      ],
    },
    {
      code: `<th rowspan="0"></th>`,
      errors: [
        {
          message:
            "Attribute 'rowspan=\"0\"' on '<th>' is not a widely available baseline feature.",
          column: 14,
          endColumn: 15,
        },
      ],
    },
  ],
});

templateRuleTester.run("[template] use-baseline", rule, {
  valid: [
    {
      code: "html`<option></option>`;",
    },
  ],
  invalid: [
    {
      code: "html`<select size='2'></select>`;",
      errors: [
        {
          message:
            "Attribute 'size' on '<select>' is not a widely available baseline feature.",
          column: 14,
          endColumn: 18,
          line: 1,
        },
      ],
    },
    {
      code: "html`<select size='${1}'></select>`;",
      errors: [
        {
          message:
            "Attribute 'size' on '<select>' is not a widely available baseline feature.",
          column: 14,
          endColumn: 18,
          line: 1,
        },
      ],
    },
  ],
});
