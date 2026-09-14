---
name: debug
description: Diagnose and fix a bug or failing test. Use when behavior is wrong, an error is reported, or a test fails and the root cause is not yet proven.
metadata:
  version: "1.0"
---

# debug

Work in this order:

1. **Write a failing repro.** Before touching any code, produce the smallest script, test, or command that fails today. If you cannot reproduce it, say so and stop — do not guess at a fix.
2. **State expected vs actual.** One or two sentences each; carry both into the PR description.
3. **Find the smallest module.** Narrow the failure to the smallest module, function, or file before editing anything.
4. **One hypothesis at a time.** State the hypothesis, make the single change it predicts, re-run the repro. If it is wrong, revert and form the next one.
5. **Fix the cause, not the symptom.** No swallowing errors, no catching-and-continuing, no widening a conditional just to make a test pass.
6. **Add or update a test.** The repro from step 1 becomes a committed regression test.
7. **Run the repo test command** (see AGENTS.md). All tests must pass before handoff.

## Hard rules

- Do not shotgun-edit: no bulk find-and-replace, no stacked speculative patches.
- Do not skip tests, even for a "trivial" fix.
- Do not merge.

The PR must include: the repro, the root cause, the test added, and the residual risk (what could still break).

When done, follow `skills/pr-handoff`.
