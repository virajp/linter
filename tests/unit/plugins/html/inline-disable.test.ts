// Ported from @html-eslint/eslint-plugin v0.68.0 (MIT), tests/inline-disable.test.js.
import { Linter } from "eslint";
import { describe, expect, it } from "vitest";
import html from "../../../../src/plugins/html/index.js";

const LANGUAGE_OPTIONS: Linter.Config = {
  files: ["**/*.html"],
  plugins: {
    html,
  },
  language: "html/html",
};

function getLinter(options: Linter.Config) {
  const linter = new Linter({
    configType: "flat",
  });

  return {
    lint(code: string, rulesConfig: Linter.RulesRecord) {
      return linter.verify(
        code,
        {
          ...options,
          rules: rulesConfig,
        },
        "test.html",
      );
    },
  };
}

describe("inline disable", () => {
  const languageLinter = getLinter(LANGUAGE_OPTIONS);

  it("eslint-disable all rules", () => {
    const code = `
<!-- eslint-disable -->
<div style="foo"></div>
<div foo="foo" foo="foo"></div>
   `;
    const rules: Linter.RulesRecord = {
      "html/no-inline-styles": "error",
      "html/no-duplicate-attrs": "error",
    };

    const languageResult = languageLinter.lint(code, rules);
    expect(languageResult).toHaveLength(0);
  });

  it("eslint-disable and enable all rules", () => {
    const code = `
<!-- eslint-disable -->
<div style="foo"></div>
<!-- eslint-enable -->
<div style="foo"></div>
<div foo="foo" foo="foo"></div>
   `;
    const rules: Linter.RulesRecord = {
      "html/no-inline-styles": "error",
      "html/no-duplicate-attrs": "error",
    };

    const languageResult = languageLinter.lint(code, rules);
    expect(languageResult).toHaveLength(2);
  });

  it("eslint-disable rule", () => {
    const code = `
<!-- eslint-disable html/no-inline-styles -->
<div style="foo"></div>
      `;
    const rule: Linter.RulesRecord = {
      "html/no-inline-styles": "error",
    };
    const languageResult = languageLinter.lint(code, rule);
    expect(languageResult).toHaveLength(0);
  });
  it("eslint-disable-next-line rule", () => {
    const code = `
<!-- eslint-disable-next-line html/require-img-alt -->
<img src="/some/path"></img>
  `;
    const rule: Linter.RulesRecord = {
      "html/require-img-alt": "error",
    };
    const languageResult = languageLinter.lint(code, rule);
    expect(languageResult).toHaveLength(0);
  });
});
