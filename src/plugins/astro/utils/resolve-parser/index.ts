// Ported from eslint-plugin-astro v3.2.1 (MIT), src/utils/resolve-parser/index.ts.
import * as typescriptESLintParser from "@typescript-eslint/parser";
import type { parseForESLint } from "@typescript-eslint/parser";
import { getEspree } from "./espree.js";
import { requireUserLocal } from "./require-user.js";

/**
 * Load a parser. `@typescript-eslint/parser` and `espree` come from this
 * package; `@babel/eslint-parser` comes from the user's local install.
 */
function loadParser(id: string): unknown {
  if (id === "@typescript-eslint/parser") {
    return typescriptESLintParser;
  }
  if (id === "espree") {
    return getEspree();
  }
  return requireUserLocal(id);
}

/** Resolve parser */
export function resolveParser(): { parseForESLint: typeof parseForESLint } {
  const modules = [
    "@typescript-eslint/parser",
    "@babel/eslint-parser",
    "espree",
  ];
  for (const id of modules) {
    const parser = toParserForESLint(loadParser(id));
    if (!parser) {
      continue;
    }
    return parser;
  }

  return toParserForESLint(getEspree())!;
}

/** Get the installed parser ID */
export function getInstalledParserId(): "@typescript-eslint/parser" | "@babel/eslint-parser" | undefined {
  const modules = ["@typescript-eslint/parser", "@babel/eslint-parser"] as const;
  return modules.find(loadParser);
}

/** To the parser for ESLint */
function toParserForESLint(
  mod: any,
): { parseForESLint: typeof parseForESLint } | null {
  for (const m of [mod, mod && mod.default]) {
    if (!m) {
      continue;
    }
    if (typeof m.parseForESLint === "function") {
      return m;
    }
    if (typeof m.parse === "function") {
      return {
        parseForESLint(...args) {
          return {
            ast: m.parse(...args),
          } as never;
        },
      };
    }
  }
  return null;
}
