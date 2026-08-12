-- Allow a pre-processing state for deliveries stored but not yet processed.
ALTER TABLE webhook_deliveries DROP CONSTRAINT IF EXISTS webhook_deliveries_processing_status_check;
ALTER TABLE webhook_deliveries ADD CONSTRAINT webhook_deliveries_processing_status_check
  CHECK (processing_status IN ('received','processed','ignored','failed'));

-- Store the payload BYTE-VERBATIM (jsonb would canonicalize/reorder it; raw evidence must be recoverable exactly).
ALTER TABLE webhook_deliveries DROP COLUMN payload_json;
ALTER TABLE webhook_deliveries ADD COLUMN payload_text text NOT NULL;
