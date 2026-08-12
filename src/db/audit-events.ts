// audit_events is append-only. This module exposes INSERT and SELECT only.
import type { PoolClient } from "pg";

import { query } from "./client";

export interface AuditEvent {
  event_id: string;
  delivery_id: string | null;
  installation_id: string | null;
  organization_login: string | null;
  project_node_id: string | null;
  project_item_node_id: string | null;
  content_type: string | null;
  content_node_id: string | null;
  content_title: string | null;
  content_url: string | null;
  field_node_id: string | null;
  field_name: string | null;
  field_type: string | null;
  previous_value_json: unknown;
  current_value_json: unknown;
  actor_login: string | null;
  occurred_at: Date | null;
  received_at: Date | null;
  source: string;
  created_at: Date;
}

export type NewAuditEvent = Omit<
  AuditEvent,
  "created_at" | "previous_value_json" | "current_value_json"
> & {
  previous_value: unknown;
  current_value: unknown;
  source: "github_webhook";
};

const columns = [
  "event_id", "delivery_id", "installation_id", "organization_login",
  "project_node_id", "project_item_node_id", "content_type", "content_node_id",
  "content_title", "content_url", "field_node_id", "field_name", "field_type",
  "previous_value_json", "current_value_json", "actor_login", "occurred_at", "received_at",
  "source",
] as const;

export async function insertAuditEvent(
  client: PoolClient,
  event: NewAuditEvent,
): Promise<void> {
  const persistedEvent = {
    ...event,
    previous_value_json: event.previous_value,
    current_value_json: event.current_value,
  };
  const values = columns.map((column) => persistedEvent[column]);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  await client.query(
    `INSERT INTO audit_events (${columns.join(", ")}) VALUES (${placeholders})`,
    values,
  );
}

export async function selectAuditEvents(limit = 50, offset = 0): Promise<AuditEvent[]> {
  const result = await query<AuditEvent>(
    "SELECT * FROM audit_events ORDER BY occurred_at DESC NULLS LAST, created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset],
  );

  return result.rows;
}
