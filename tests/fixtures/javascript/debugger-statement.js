// debugger-statement.js - should trigger no-debugger
export function debug() {
  debugger;
  return 1;
}
