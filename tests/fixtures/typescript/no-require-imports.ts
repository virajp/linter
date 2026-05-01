// no-require-imports.ts - should trigger @typescript-eslint/no-require-imports
const fs = require("node:fs");
export const read = fs.readFileSync;
