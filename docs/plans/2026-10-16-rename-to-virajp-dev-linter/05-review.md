# U5 — Review: settings.json behavior, tombstone, CI, rename

- **Wave:** 3
- **Depends on:** U1, U2, U3, U4
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

This row covers U1, U2, U3, and U4. It reviews the branch delta since the
branch base, because it is the first review row.

Reason (index.md, assumed decision 14): the plan lands runnable code. U1
changes `src/cli/commands/init.ts`. U2 adds the tombstone bin and module. U3
changes `release.yml` and `smoke.mjs`. U4 changes the scaffold that `--init`
writes.
