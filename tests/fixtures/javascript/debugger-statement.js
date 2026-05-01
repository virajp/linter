// debugger-statement.js - should trigger no-debugger (auto-fixable)
export function debug() {
  debugger;
  return 1;
}
