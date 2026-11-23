---
type: vwf-design-system
title: Design System
description: Product-wide terminal UX contract for the one command-line surface
  of the product. Text-only: the product has no screen surface.
status: reviewed
timestamp: 2026-11-23
---

# Design System

> **Text-only design system.** The registry declares no screen platform. The
> only surface is a terminal (`cli`), so this doc holds the Terminal UX contract
> only. No design tool import applies, and the screen sections (color tokens,
> type and spacing scales, motion, brand) do not apply. Add them when a screen
> project enters the registry.

## Scope

- **Not applicable to a terminal surface:** Brand & Mood (brand comes only
  from a design-tool import, and there is none), Color Tokens, Typography,
  Spacing & Layout, Motion, and the screen component behaviors (buttons,
  inputs and forms, overlays, toasts).
- **Applicable:** Terminal UX, Accessibility (text rules), the terminal states
  (empty, progress, error), and Anti-Patterns.

## Terminal UX

- **Output formatting.**
  - The default output is for people, on stdout.
  - The lint results use the selected result format. The default format is a
    grouped list: one group for each file, one line for each problem.
  - Machine output comes only from a machine result format, selected with the
    format flag (for example `json`). The product has no separate machine flag,
    and the commands that are not lint (init, version, help) have no machine
    mode.
  - The quiet flag is the only verbosity level: it shows errors only. There is
    no verbose level; the debug flag is for diagnosis, not for normal use.
  - stdout carries results and the output of each command. stderr carries
    error messages, diagnostics and the progress indicator. Nothing else goes
    to stderr on a clean run.
- **Color semantics.**
  - Color marks roles only. The contract names roles, not color values, so
    that the user's terminal palette maps each role:
    - `error`: a lint error, and the label of an init action that failed.
    - `warn`: a lint warning, and the label of an init action that was
      skipped.
    - `success`: the label of an init action that wrote a file (`created`,
      `updated`). Nothing else uses it.
    - `emphasis`: a file path that heads a group of problems.
  - When the `NO_COLOR` environment variable is set, or the output is not a
    terminal, the output has no color.
- **Progress conventions.**
  - On a terminal, a run that lasts more than 1 second shows a spinner on
    stderr. The spinner is cleared before the results print.
  - The spinner never shows when the output is not a terminal, when
    `NO_COLOR` is set, with the quiet flag, or with a result format other than
    the default. In these cases the run is silent until it is done.
- **Errors and exit codes.**
  - Exit code 0: no lint errors, and the warnings are not more than the
    maximum that the user sets.
  - Exit code 1: one or more lint errors, warnings more than that maximum, or a
    failure of the run (for example an unknown flag or a configuration that is
    not valid).
  - An error message is one line on stderr. It says what happened and what to
    do next.
  - The usage text prints only for the help flag. An unknown flag prints an
    error message that names the flag, not the full usage text.
- **Help and naming.**
  - The command has flags only, no subcommands. File and folder arguments come
    after the flags; `--` ends the flags.
  - Flags are long, in `--kebab-case`. Short forms exist only for version
    (`-v`), help (`-h`) and format (`-f`).
  - A flag that turns a default off is written `--no-<flag>`.
  - The help text starts with one usage line:
    `@virajp.dev/linter [options] [files...]`. Then comes an `Options:` list
    with one flag on each line and the descriptions aligned in one column. A
    description that wraps continues under that column. A short form follows
    its long form (`--format, -f`). A flag argument is written in angle
    brackets (`<n>`, `<path>`). Each description is short and in the
    imperative.
  - Help and version print on stdout and exit with code 0.
- **Terminal states.**
  - **Empty.** A clean lint run, and a run that finds no files to lint, print
    nothing and exit with code 0.
  - **Progress.** The spinner of the progress conventions above.
  - **Error.** The one-line error message of the errors rules above.

## Accessibility

There is no screen conformance target, because the product has no screen. The
terminal output obeys these rules:

- Meaning never depends on color alone. Each colored role also has a word or a
  symbol (for example `error`, `warning`, `[created]`).
- The output is fully readable with `NO_COLOR` set.
- Nothing moves when the output is not a terminal; the spinner is the only
  animation.
- All input is by flags and arguments. No run needs a key press or a prompt.
- Output is plain lines of text, so a screen reader reads it in order.

## Anti-Patterns

- Output on stdout that is not a result: progress text, hints or banners mix
  with results and break pipes.
- A color as the only carrier of meaning: each colored role also has a word or
  a symbol, so the output stays clear with no color.
- A prompt for input during a run: the command is for pipelines too, so it never
  waits for input.

## Open Questions

- The 1-second threshold of the spinner is a first value. Examine it when real
  run times are known.
- The spinner is not built yet. Until it is, a run on a terminal is silent
  until it is done.
