import { randomUUID } from "node:crypto";

import { insertAuditEvent, type NewAuditEvent } from "@/db/audit-events";
import { query, withTransaction } from "@/db/client";
import { env } from "@/lib/env";
import { normalizeFieldValue } from "@/lib/github/normalize";
import { verifyGitHubSignature } from "@/lib/github/signature";
import { toJsonb } from "@/lib/json";

export const runtime = "nodejs";

type DeliveryRow = { delivery_id: string };
type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizedHeaders(headers: Headers): Record<string, string> {
  return Object.fromEntries(
    [...headers.entries()].filter(
      ([name]) => !["authorization", "cookie"].includes(name.toLowerCase()),
    ),
  );
}

function extractAction(rawBody: string): string | null {
  try {
    const payload: unknown = JSON.parse(rawBody);
    return isObject(payload) && typeof payload.action === "string" ? payload.action : null;
  } catch {
    return null;
  }
}

function humanMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Unknown processing error";
}

async function updateDelivery(
  deliveryId: string,
  status: "ignored" | "failed",
  error: string | null,
): Promise<void> {
  await query(
    `UPDATE webhook_deliveries
       SET processing_status = $2, processing_error = $3
       WHERE delivery_id = $1`,
    [deliveryId, status, error],
  );
}

async function bestEffortUpdateDelivery(
  deliveryId: string,
  status: "ignored" | "failed",
  error: string | null,
): Promise<void> {
  try {
    await updateDelivery(deliveryId, status, error);
  } catch {
    // The signed raw delivery is already durable. Processing errors still return
    // 200 even if the follow-up status write encounters a database outage.
  }
}

function failedResponse(deliveryId: string): Response {
  return Response.json({ delivery_id: deliveryId, status: "failed" }, { status: 200 });
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-hub-signature-256");
  const deliveryId = request.headers.get("x-github-delivery");
  const eventName = request.headers.get("x-github-event");
  const secret = env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    return Response.json({ error: "Webhook service is not configured" }, { status: 500 });
  }

  if (!verifyGitHubSignature({ secret, rawBody, signatureHeader })) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  if (!deliveryId || !eventName) {
    return Response.json(
      { error: "Missing X-GitHub-Delivery or X-GitHub-Event" },
      { status: 400 },
    );
  }

  const action = extractAction(rawBody);
  const receivedAt = new Date();

  try {
    const result = await query<DeliveryRow>(
      `INSERT INTO webhook_deliveries (
        delivery_id, event_name, action, headers_json, payload_text,
        received_at, processing_status, processing_error
      ) VALUES ($1, $2, $3, $4, $5, $6, 'received', null)
      ON CONFLICT (delivery_id) DO NOTHING
      RETURNING delivery_id`,
      [deliveryId, eventName, action, sanitizedHeaders(request.headers), rawBody, receivedAt],
    );

    if (result.rowCount === 0) {
      return Response.json({ delivery_id: deliveryId, duplicate: true }, { status: 200 });
    }
  } catch {
    return Response.json({ error: "Unable to store webhook delivery" }, { status: 500 });
  }

  let payload: JsonObject;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!isObject(parsed)) throw new Error("payload is not an object");
    payload = parsed;
  } catch (error) {
    await bestEffortUpdateDelivery(
      deliveryId,
      "failed",
      `Unable to parse signed JSON: ${humanMessage(error)}`,
    );
    return failedResponse(deliveryId);
  }

  const payloadAction = typeof payload.action === "string" ? payload.action : null;
  const item = isObject(payload.projects_v2_item) ? payload.projects_v2_item : null;
  const changes = isObject(payload.changes) ? payload.changes : null;
  const fieldValue = changes?.field_value;
  const projectNodeId = item && typeof item.project_node_id === "string"
    ? item.project_node_id
    : null;

  if (
    eventName !== "projects_v2_item" ||
    payloadAction !== "edited" ||
    fieldValue === undefined
  ) {
    await bestEffortUpdateDelivery(deliveryId, "ignored", null);
    return Response.json({ delivery_id: deliveryId, status: "ignored" }, { status: 200 });
  }

  if (projectNodeId === null) {
    await bestEffortUpdateDelivery(deliveryId, "failed", "Required project_node_id is missing");
    return failedResponse(deliveryId);
  }

  if (projectNodeId !== env.GITHUB_TARGET_PROJECT_NODE_ID) {
    await bestEffortUpdateDelivery(deliveryId, "ignored", null);
    return Response.json({ delivery_id: deliveryId, status: "ignored" }, { status: 200 });
  }

  const normalized = normalizeFieldValue(fieldValue);
  if (normalized.outcome === "unsupported") {
    await bestEffortUpdateDelivery(deliveryId, "failed", normalized.reason);
    return failedResponse(deliveryId);
  }

  try {
    const installation = isObject(payload.installation) ? payload.installation : null;
    const organization = isObject(payload.organization) ? payload.organization : null;
    const sender = isObject(payload.sender) ? payload.sender : null;
    const installationId = installation?.id;
    const organizationLogin = organization?.login;
    const projectItemNodeId = item?.id;
    const contentType = item?.content_type;
    const contentNodeId = item?.content_node_id;

    if (
      (typeof installationId !== "number" && typeof installationId !== "string") ||
      typeof organizationLogin !== "string" ||
      typeof projectItemNodeId !== "string" ||
      typeof contentType !== "string" ||
      typeof contentNodeId !== "string"
    ) {
      throw new Error("Required installation, organization, project item, or content identifier is missing");
    }

    const eventId = randomUUID();
    const event: NewAuditEvent = {
      event_id: eventId,
      delivery_id: deliveryId,
      installation_id: String(installationId),
      organization_login: organizationLogin,
      project_node_id: projectNodeId,
      project_item_node_id: projectItemNodeId,
      content_type: contentType,
      content_node_id: contentNodeId,
      content_title: null,
      content_url: null,
      field_node_id: normalized.field_node_id,
      field_name: normalized.field_name,
      field_type: normalized.field_type,
      previous_value: normalized.values.previous_value,
      current_value: normalized.values.current_value,
      actor_login: sender && typeof sender.login === "string" ? sender.login : null,
      occurred_at: null,
      received_at: receivedAt,
      source: "github_webhook",
    };

    await withTransaction(async (client) => {
      await insertAuditEvent(client, event);
      await client.query(
        `INSERT INTO current_values (
          item_node_id, field_node_id, value_json, observed_at, source
        ) VALUES ($1, $2, $3, $4, 'github_webhook')
        ON CONFLICT (item_node_id, field_node_id) DO UPDATE SET
          value_json = EXCLUDED.value_json,
          observed_at = EXCLUDED.observed_at,
          source = EXCLUDED.source`,
        [
          projectItemNodeId,
          normalized.field_node_id,
          toJsonb(normalized.values.current_value),
          receivedAt,
        ],
      );
      await client.query(
        `UPDATE webhook_deliveries
           SET processing_status = 'processed', processing_error = null
           WHERE delivery_id = $1`,
        [deliveryId],
      );
    });

    return Response.json(
      { delivery_id: deliveryId, status: "processed", event_id: eventId },
      { status: 200 },
    );
  } catch (error) {
    await bestEffortUpdateDelivery(deliveryId, "failed", humanMessage(error));
    return failedResponse(deliveryId);
  }
}
