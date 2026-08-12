import { createHmac } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { insertAuditEvent } from "@/db/audit-events";
import { query, withTransaction } from "@/db/client";
import { env } from "@/lib/env";

import { POST } from "./route";

vi.mock("@/db/client", () => ({ query: vi.fn(), withTransaction: vi.fn() }));
vi.mock("@/db/audit-events", () => ({ insertAuditEvent: vi.fn() }));

const secret = "route-test-secret";
const targetProject = "PVT_target";
const fieldValue = {
  field_node_id: "PVTSSF_lADOBH2n9s4Aje1Izgb1kEs",
  field_type: "single_select",
  field_name: "Status",
  project_number: 18,
  from: { id: "f75ad846", name: "Todo", color: "GREEN", description: "..." },
  to: { id: "47fc9ee4", name: "In Progress", color: "YELLOW", description: "..." },
};
const basePayload = {
  action: "edited",
  installation: { id: 12345 },
  organization: { login: "example-org" },
  projects_v2_item: {
    project_node_id: targetProject,
    id: "PVTI_item",
    content_type: "Issue",
    content_node_id: "I_issue",
  },
  changes: { field_value: fieldValue },
  sender: { login: "octocat" },
};

const mockedQuery = vi.mocked(query);
const mockedWithTransaction = vi.mocked(withTransaction);
const mockedInsertAuditEvent = vi.mocked(insertAuditEvent);
const client = { query: vi.fn() };

function signature(body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

function request(
  payload: unknown = basePayload,
  overrides: Partial<Record<"signature" | "delivery" | "event", string | null>> = {},
): Request {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  const headers = new Headers({
    "content-type": "application/json",
    "x-hub-signature-256": signature(body),
    "x-github-delivery": "delivery-123",
    "x-github-event": "projects_v2_item",
    authorization: "Bearer must-not-be-stored",
    cookie: "session=must-not-be-stored",
  });
  const names = {
    signature: "x-hub-signature-256",
    delivery: "x-github-delivery",
    event: "x-github-event",
  } as const;

  for (const [key, value] of Object.entries(overrides)) {
    const name = names[key as keyof typeof names];
    if (value === null) headers.delete(name);
    else if (value !== undefined) headers.set(name, value);
  }

  return new Request("http://localhost/api/github/webhooks", { method: "POST", headers, body });
}

function storedDelivery(): void {
  mockedQuery.mockResolvedValueOnce({ rows: [{ delivery_id: "delivery-123" }], rowCount: 1 } as never);
}

describe("POST /api/github/webhooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.GITHUB_WEBHOOK_SECRET = secret;
    env.GITHUB_TARGET_PROJECT_NODE_ID = targetProject;
    mockedWithTransaction.mockImplementation(async (operation) => operation(client as never));
    mockedInsertAuditEvent.mockResolvedValue(undefined);
    client.query.mockResolvedValue({ rows: [], rowCount: 1 });
  });

  it("atomically persists a target single-select edit and marks it processed", async () => {
    storedDelivery();

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ delivery_id: "delivery-123", status: "processed" });
    expect(body.event_id).toMatch(/^[0-9a-f-]{36}$/);
    const deliveryValues = mockedQuery.mock.calls[0][1];
    expect(deliveryValues?.[4]).toBe(JSON.stringify(basePayload));
    expect(deliveryValues?.[3]).toMatchObject({
      "x-github-delivery": "delivery-123",
      "x-github-event": "projects_v2_item",
    });
    expect(deliveryValues?.[3]).not.toHaveProperty("authorization");
    expect(deliveryValues?.[3]).not.toHaveProperty("cookie");
    expect(mockedWithTransaction).toHaveBeenCalledOnce();
    expect(mockedInsertAuditEvent).toHaveBeenCalledOnce();
    expect(mockedInsertAuditEvent.mock.calls[0][0]).toBe(client);
    expect(mockedInsertAuditEvent.mock.calls[0][1]).toMatchObject({
      event_id: body.event_id,
      delivery_id: "delivery-123",
      installation_id: "12345",
      organization_login: "example-org",
      project_node_id: targetProject,
      project_item_node_id: "PVTI_item",
      content_type: "Issue",
      content_node_id: "I_issue",
      content_title: null,
      content_url: null,
      field_node_id: fieldValue.field_node_id,
      field_name: "Status",
      field_type: "single_select",
      previous_value: { option_id: "f75ad846", label: "Todo" },
      current_value: { option_id: "47fc9ee4", label: "In Progress" },
      actor_login: "octocat",
      occurred_at: null,
      source: "github_webhook",
    });
    expect(client.query).toHaveBeenCalledTimes(2);
    expect(client.query.mock.calls[0][0]).toContain("INSERT INTO current_values");
    expect(client.query.mock.calls[0][1]?.[2]).toEqual({
      option_id: "47fc9ee4",
      label: "In Progress",
    });
    expect(client.query.mock.calls[1][0]).toContain("processing_status = 'processed'");
  });

  it("ignores a different project without processing", async () => {
    storedDelivery();
    mockedQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const payload = {
      ...basePayload,
      projects_v2_item: { ...basePayload.projects_v2_item, project_node_id: "PVT_other" },
    };

    const response = await POST(request(payload));

    await expect(response.json()).resolves.toEqual({ delivery_id: "delivery-123", status: "ignored" });
    expect(mockedQuery.mock.calls[1][0]).toContain("processing_status = $2");
    expect(mockedQuery.mock.calls[1][1]).toEqual(["delivery-123", "ignored", null]);
    expect(mockedInsertAuditEvent).not.toHaveBeenCalled();
    expect(mockedWithTransaction).not.toHaveBeenCalled();
  });

  it("ignores a non-edited action", async () => {
    storedDelivery();
    mockedQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);

    const response = await POST(request({ ...basePayload, action: "created" }));

    await expect(response.json()).resolves.toMatchObject({ status: "ignored" });
    expect(mockedWithTransaction).not.toHaveBeenCalled();
  });

  it("fails an unsupported field type while retaining the delivery", async () => {
    storedDelivery();
    mockedQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const payload = { ...basePayload, changes: { field_value: { ...fieldValue, field_type: "text" } } };

    const response = await POST(request(payload));

    await expect(response.json()).resolves.toEqual({ delivery_id: "delivery-123", status: "failed" });
    expect(mockedQuery.mock.calls[1][1]).toEqual([
      "delivery-123",
      "failed",
      "field type text not yet supported",
    ]);
    expect(mockedInsertAuditEvent).not.toHaveBeenCalled();
    expect(mockedWithTransaction).not.toHaveBeenCalled();
  });

  it("returns duplicate without processing a redelivery", async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    const response = await POST(request());

    await expect(response.json()).resolves.toEqual({ delivery_id: "delivery-123", duplicate: true });
    expect(mockedQuery).toHaveBeenCalledOnce();
    expect(mockedWithTransaction).not.toHaveBeenCalled();
  });

  it("rejects an invalid signature with zero writes", async () => {
    const response = await POST(request(basePayload, { signature: "sha256=bad" }));

    expect(response.status).toBe(401);
    expect(mockedQuery).not.toHaveBeenCalled();
    expect(mockedWithTransaction).not.toHaveBeenCalled();
  });

  it("rejects missing delivery headers after verification with zero writes", async () => {
    const response = await POST(request(basePayload, { delivery: null }));

    expect(response.status).toBe(400);
    expect(mockedQuery).not.toHaveBeenCalled();
  });
});
