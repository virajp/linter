---
type: vwf-flow
title: Refresh the dependencies
description: Each week the pipeline updates the dependencies and releases a
  new version from main.
status: reviewed
implementation: none
---

# Flow: Refresh the dependencies

## Purpose

Each Monday the pipeline updates the bundled packages and, when one changed,
releases a new version from the head of main. A tool release follows each core
release within 7 days, as [goal-no-drift](../../../product.md#goal-no-drift)
and [reliability](../../../conventions.md#reliability) define it.

Serves: [goal-no-drift](../../../product.md#goal-no-drift)

## Trigger & Actors

- **The pipeline** runs the job each Monday at 02:00 UTC. The owner can also
  start it by hand. One run at a time; the job and the release pipeline share
  one concurrency group.
- Audit-recorded: no — no audit foundation; the forge keeps the run log.

## Steps

1. Work on the head of main. Unreleased code on main ships with the update.
2. Update every dependency to its latest version, except the major versions
   that the dependency policy holds. No change: stop, with no commit and no
   release.
3. Run the dependency scanner
   ([pipeline](../../../conventions.md#pipeline)).
4. Write the golden snapshots again. A changed rule, problem or fix is
   accepted, and the change shows in the release commit.
5. Run all tests, pack the package, and run the binding check and the smoke
   run on the packed package ([testing](../../../conventions.md#testing)).
6. Commit the update and the release on main. The version is the higher of the
   release level recorded on main and PATCH; the release clears the level.
   Tag the commit `v<next>` and push main and the tag together.
7. Start the release pipeline on the tag.

Screens, background jobs and API operations: n/a — a pipeline job of a cli
project.

## Failure

- A failed gate in steps 3–5: no commit, no tag, no release. The run fails and
  the forge notifies the owner.
- A rejected push in step 6 (main moved): no tag. The next run starts again.
- A failed release: the tag stays and is never moved; fix forward and release
  the next version ([incidents](../../../conventions.md#incidents)).

## Acceptance

- No dependency changed: no commit and no release.
- A changed dependency and green gates: a new version from main, tagged
  `v<next>`, published, with the release commit on main.
- A failed gate: no tag and no release; the owner is notified.
- A core release reaches a tool release within 7 days.
