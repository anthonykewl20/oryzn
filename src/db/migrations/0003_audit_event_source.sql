ALTER TABLE audit_events
  ADD COLUMN source text NOT NULL DEFAULT 'github_webhook';
