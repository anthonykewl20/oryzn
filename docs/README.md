# GitHub Projects Audit History — Pseudocode

These framework-neutral files describe the prototype’s application logic.

## Files

- [`01_webhook_ingestion.pseudo`](01_webhook_ingestion.pseudo): signature verification, idempotency, normalization, and atomic persistence.
- [`02_baseline_sync.pseudo`](02_baseline_sync.pseudo): initial Project snapshot without fake historical events.
- [`03_reconciliation.pseudo`](03_reconciliation.pseudo): comparison of stored current state with GitHub.
- [`04_timeline_query.pseudo`](04_timeline_query.pseudo): filtering and rendering the read-only history.
- [`05_value_normalization.pseudo`](05_value_normalization.pseudo): canonical representations for supported Project field types.

## Core invariants

1. Raw delivery evidence is stored before normalization.
2. A GitHub delivery ID is processed at most once.
3. Audit events are append-only.
4. Event insertion and current-state update are atomic.
5. Baseline values are not historical events.
6. Reconciliation mismatches are not fabricated history.
7. The prototype never mutates GitHub Project data.

