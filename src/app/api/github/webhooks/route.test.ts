import { createHmac } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { query } from "@/db/client";
import { env } from "@/lib/env";

import { POST } from "./route";

vi.mock("@/db/client", () => ({ query: vi.fn() }));

const secret = "route-test-secret";
const rawBody = '{\n  "action": "edited",\n  "value": 1\n}\n';
const mockedQuery = vi.mocked(query);

function signature(body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

function request(
  overrides: Partial<Record<"signature" | "delivery" | "event", string | null>> = {},
): Request {
  const headers = new Headers({
    "content-type": "application/json",
    "x-hub-signature-256": signature(rawBody),
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

  return new Request("http://localhost/api/github/webhooks", {
    method: "POST",
    headers,
    body: rawBody,
  });
}

describe("POST /api/github/webhooks", () => {
  beforeEach(() => {
    env.GITHUB_WEBHOOK_SECRET = secret;
  });

  it("stores a valid signed delivery with the exact raw body", async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ delivery_id: "delivery-123" }],
      rowCount: 1,
    } as never);

    const response = await POST(request());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      delivery_id: "delivery-123",
      status: "received",
    });
    expect(mockedQuery).toHaveBeenCalledOnce();
    const [sql, values] = mockedQuery.mock.calls[0];
    expect(sql).toContain("payload_text");
    expect(sql).toContain("'received'");
    expect(values?.[4]).toBe(rawBody);
    expect(values?.[2]).toBe("edited");
    expect(values?.[3]).toMatchObject({
      "x-github-delivery": "delivery-123",
      "x-github-event": "projects_v2_item",
      "x-hub-signature-256": signature(rawBody),
    });
    expect(values?.[3]).not.toHaveProperty("authorization");
    expect(values?.[3]).not.toHaveProperty("cookie");
  });

  it("reports a repeated delivery as a duplicate without creating another row", async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ delivery_id: "delivery-123" }], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);

    expect((await POST(request())).status).toBe(200);
    const duplicate = await POST(request());

    expect(duplicate.status).toBe(200);
    await expect(duplicate.json()).resolves.toEqual({
      delivery_id: "delivery-123",
      duplicate: true,
    });
    expect(mockedQuery).toHaveBeenCalledTimes(2);
    expect(mockedQuery.mock.calls[1][0]).toContain("ON CONFLICT (delivery_id) DO NOTHING");
  });

  it("rejects an invalid signature without writing to the database", async () => {
    const response = await POST(request({ signature: "sha256=bad" }));

    expect(response.status).toBe(401);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("rejects a missing signature without writing to the database", async () => {
    const response = await POST(request({ signature: null }));

    expect(response.status).toBe(401);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("rejects a missing delivery ID after verification without writing", async () => {
    const response = await POST(request({ delivery: null }));

    expect(response.status).toBe(400);
    expect(mockedQuery).not.toHaveBeenCalled();
  });
});
