# Oryzn Roadmap

**Last updated:** 2026-08-12

## Source of truth

GitHub Issues is the granular tracker for work and issue state. This file records only milestones, their exit conditions, the MVP completion evidence, and the Phase-2 gate.

## MVP milestones

| Milestone | Exit condition | Status |
|---|---|---|
| Day 1 — Signed evidence | One signed GitHub delivery is visible in the database. | Not started |
| Day 2 — Audit event | A Status change produces one correct normalized event. | Not started |
| Day 3 — Baseline and field coverage | The baseline matches GitHub and all supported field types can be captured. | Not started |
| Day 4 — Usable timeline | A non-developer can inspect and understand captured changes. | Not started |
| Day 5 — Trust test | No unexplained missing or duplicate events remain. | Not started |

## MVP completion evidence

- Acceptance-test result/date: _Pending_
- 50-change test result/date: _Pending_
- Reconciliation evidence: _Pending_
- Demo recording link: _Pending_

## Phase 2 — Rollback gate

- [ ] All MVP acceptance tests pass.
- [ ] Reconciliation consistently explains current-state drift.
- [ ] At least three pilot customers explicitly request restoration and are willing to grant Project write access.
- [ ] The proposed rollback UX includes a preview and confirmation.
- [ ] The mutation checks that the current GitHub value still equals the expected value.
- [ ] Every rollback produces a new audit event.
- [ ] Partial failures are visible and retryable.

The first rollback version restores one field on one item. Bulk rollback is out of scope for that version.

## Status summary

Current status: **Planning**. The next exit condition is Day 1 signed delivery. There is no blocker.

## Update contract

Update this file only when a milestone starts or completes, an exit condition changes, the MVP or Phase-2 gate changes, or the status summary changes. Never update it for individual issue state.
