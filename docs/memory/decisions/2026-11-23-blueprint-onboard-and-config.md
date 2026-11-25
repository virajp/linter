DECISION 2026-11-23 ★3 | product:linter | blueprint pass 1: flow 110
onboard-a-repo, entity linter-config, first conventions | /vwf:blueprint

# Blueprint pass 1: onboarding and the configuration file

Source: the `/vwf:blueprint` sweep of 2026-11-23, first pass. The user
answered each question. The docs record each rule; this record keeps only
what changed from today's code and why.

## Decisions

- **D1** ★3 | record today's behavior | for each precision hole the reviewers
  found in init and in the configuration file, the user chose to record what
  the code does today, not to design new behavior | alt: decide each case
  again — rejected, the behavior works and the goal is adoption
- **D2** ★3 | unknown names | an unknown preset name and an unknown key inside
  a preset entry warn and are ignored, like an unknown top-level key; this is
  new: today an unknown preset name is silent | alt: ignore silently; fail
  the run — rejected
- **D3** ★3 | config version | only version 1 (number or string) is accepted;
  any other value fails the run; this is new: today any value passes | alt:
  accept any value — rejected
- **D4** ★2 | baseline | `boundary-validation` is waived for linter-config
  (forward-compatible warnings); `structured-logs-no-pii` is inapplicable to
  the debug flag; the one ignored advisory has a dependency-audit waiver
- **D5** ★2 | review loop | the reviewer loops for flow 110 (6 rounds) and
  linter-config (8 rounds) did not converge on new detail; the user chose to
  record the final items and mark both reviewed
