CREATE TABLE github_installations (
  installation_id bigint PRIMARY KEY,
  organization_login text,
  created_at timestamptz
);

CREATE TABLE tracked_projects (
  project_node_id text PRIMARY KEY,
  installation_id bigint,
  title text,
  url text,
  tracking_started_at timestamptz,
  last_synced_at timestamptz
);

CREATE TABLE project_fields (
  field_node_id text PRIMARY KEY,
  project_node_id text,
  name text,
  type text,
  option_metadata_json jsonb
);

CREATE TABLE project_items (
  item_node_id text PRIMARY KEY,
  project_node_id text,
  content_node_id text,
  content_type text,
  title text,
  url text
);

CREATE TABLE current_values (
  item_node_id text,
  field_node_id text,
  value_json jsonb,
  observed_at timestamptz,
  source text,
  PRIMARY KEY (item_node_id, field_node_id)
);

CREATE TABLE webhook_deliveries (
  delivery_id text PRIMARY KEY,
  event_name text,
  action text,
  headers_json jsonb,
  payload_json jsonb,
  received_at timestamptz,
  processing_status text CHECK (processing_status IN ('processed', 'ignored', 'failed')),
  processing_error text
);

CREATE TABLE audit_events (
  event_id uuid PRIMARY KEY,
  delivery_id text UNIQUE,
  installation_id bigint,
  organization_login text,
  project_node_id text,
  project_item_node_id text,
  content_type text,
  content_node_id text,
  content_title text,
  content_url text,
  field_node_id text,
  field_name text,
  field_type text,
  previous_value_json jsonb,
  current_value_json jsonb,
  actor_login text,
  occurred_at timestamptz,
  received_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reconciliation_runs (
  run_id uuid PRIMARY KEY,
  started_at timestamptz,
  completed_at timestamptz,
  checked_value_count integer,
  mismatch_count integer,
  details_json jsonb
);

CREATE INDEX ON webhook_deliveries (received_at);
CREATE INDEX ON audit_events (project_node_id, occurred_at DESC);
