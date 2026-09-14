---
name: write-docs
description: Write or update documentation — READMEs, runbooks, and ADRs. Use when a change needs human-facing docs, an incident needs a runbook, or a decision needs recording.
metadata:
  version: "1.0"
---

# write-docs

## Where docs live

- `README.md` — for humans: what this repo is and how to use it.
- `AGENTS.md` — operating facts for agents only (commands, layout, rules). Keep it factual; it is not a design doc.
- `docs/runbooks/` — incident and operational procedures, one runbook per topic.
- `docs/adr/` — decisions, one file per decision.

Create `docs/runbooks/` or `docs/adr/` only if `docs/` already exists, or if you also add a one-line `README.md` in `docs/` saying what belongs there.

## Rules

- Document current behavior: what the code does now, verified by reading it or running it — not aspirations or plans.
- Every runbook has four sections, in order: **Symptoms**, **Checks**, **Fix**, **Escalation**.
- Update docs in the same PR as the code change they describe. No separate "docs later" PRs.

When done, follow `skills/pr-handoff`.
