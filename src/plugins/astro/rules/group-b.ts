import type { RuleModule } from "../types.js";
import noSetTextDirective from "./no-set-text-directive.js";
import noUnsafeInlineScripts from "./no-unsafe-inline-scripts.js";
import noUnusedCssSelector from "./no-unused-css-selector.js";
import noUnusedDefineVarsInStyle from "./no-unused-define-vars-in-style.js";
import preferClassListDirective from "./prefer-class-list-directive.js";
import preferObjectClassList from "./prefer-object-class-list.js";
import preferSplitClassList from "./prefer-split-class-list.js";
import semi from "./semi.js";
import sortAttributes from "./sort-attributes.js";

export const groupBRules: Record<string, RuleModule> = {
  "no-set-text-directive": noSetTextDirective,
  "no-unsafe-inline-scripts": noUnsafeInlineScripts,
  "no-unused-css-selector": noUnusedCssSelector,
  "no-unused-define-vars-in-style": noUnusedDefineVarsInStyle,
  "prefer-class-list-directive": preferClassListDirective,
  "prefer-object-class-list": preferObjectClassList,
  "prefer-split-class-list": preferSplitClassList,
  semi,
  "sort-attributes": sortAttributes,
};
