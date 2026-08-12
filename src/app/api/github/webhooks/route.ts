import { query } from "@/db/client";
import { env } from "@/lib/env";
import { verifyGitHubSignature } from "@/lib/github/signature";

export const runtime = "nodejs";

type DeliveryRow = {
  delivery_id: string;
};

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

    if (
      typeof payload === "object" &&
      payload !== null &&
      "action" in payload &&
      typeof payload.action === "string"
    ) {
      return payload.action;
    }
  } catch {
    // Raw evidence is retained even when Day 1 cannot interpret it.
  }

  return null;
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
  const headersJson = sanitizedHeaders(request.headers);

  try {
    const result = await query<DeliveryRow>(
      `INSERT INTO webhook_deliveries (
        delivery_id,
        event_name,
        action,
        headers_json,
        payload_text,
        received_at,
        processing_status,
        processing_error
      ) VALUES ($1, $2, $3, $4, $5, now(), 'received', null)
      ON CONFLICT (delivery_id) DO NOTHING
      RETURNING delivery_id`,
      [deliveryId, eventName, action, headersJson, rawBody],
    );

    if (result.rowCount === 0) {
      return Response.json({ delivery_id: deliveryId, duplicate: true }, { status: 200 });
    }

    return Response.json({ delivery_id: deliveryId, status: "received" }, { status: 200 });
  } catch {
    return Response.json({ error: "Unable to store webhook delivery" }, { status: 500 });
  }
}
