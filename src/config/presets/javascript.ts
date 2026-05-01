import js from "@eslint/js";
import globals from "globals";

export const javascriptConfig = {
  extends: [js.configs.recommended],
  files: ["**/*.{js,mjs,cjs,jsx}"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  name: "javascript",
  plugins: { js },
  rules: {},
};
