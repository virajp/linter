DECISION 2026-11-23 ★3 | product:linter | text-only design system: terminal
UX contract; spinner added; no design-tool pin | /vwf:design-system text-only

# Text-only design system

Source: the `/vwf:design-system` run of 2026-11-23. The registry has no screen
platform, so the run took the text-only path. The user answered each question.

## Decisions

- **D1** ★3 | path | text-only; no UI project is added now, because the public
  site is a product non-goal | alt: add a site project first — rejected
- **D2** ★3 | progress | a spinner on stderr, only on a terminal and only
  after 1 second; this is new behavior that the CLI does not have today | alt:
  silent until done — rejected
- **D3** ★2 | output and exit codes | keep today's model: machine output only
  through a result format, exit 1 for both lint errors and run failures | alt:
  a separate machine flag; exit 2 for run failures — rejected
- **D4** ★2 | design-system pin | no `design.design_system_id`: there is no
  design tool and no canvas project to pin
