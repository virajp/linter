# Plans

The product's plans as a set — the one file every vwf command reads to find
a plan without walking the member repos, and the queue `/vwf:execute next`
and `/vwf:execute all` read to pick the next runnable plan.

## Plans

| Folder                                              | Kind   | Plan                                                                  | Target repo | Priority | Status   | Requires | Backlog |
| --------------------------------------------------- | ------ | --------------------------------------------------------------------- | ----------- | -------- | -------- | -------- | ------- |
| `docs/plans/2026-10-16-rename-to-virajp-dev-linter` | change | Rename to @virajp.dev/linter and skip an absent .vscode/settings.json | —           | 10       | COMPLETE | —        | —       |
