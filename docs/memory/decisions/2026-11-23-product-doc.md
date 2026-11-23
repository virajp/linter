DECISION 2026-11-23 ★4 | product:linter | first product doc: goals are own
repo adoption and no drift; outside adoption and the site are out | /vwf:product
create

# First product doc

Source: the `/vwf:product` create run of 2026-11-23. The user answered each
question. The doc is `docs/blueprint/product.md`; this record keeps only the
rationale that the doc does not state.

## Decisions

- **D1** ★4 | problem framing | the cost of per-repo setup and version drift,
  not personal consistency or dependency control alone | alt: personal
  consistency; dependency control — rejected, both are effects of the setup
  cost
- **D2** ★4 | goal 1 | adoption in the owner's own repos, with the kill
  criterion below 50% by 2027-03-01 | alt: one-step setup; outside adoption
  — rejected as the main goal
- **D3** ★3 | goal 2 | no drift: 7 days or fewer from a core release to a tool
  release | alt: outside adoption; same result in editor and CLI — not taken
  as goals now
- **D4** ★3 | public site | dropped from the slice priority, because it serves
  no chosen goal. Outside adoption is a non-goal now. Backlog B03 waits until
  outside adoption becomes a goal | alt: add an outside adoption goal — rejected
- **D5** ★2 | riskiest assumption | one person can keep the owned rules
  current. It is validated by usage-data (release lag), so no slice must come
  first; onboarding stays rank 1 | alt: move dependency-refresh to rank 1;
  accepted-risk — rejected
