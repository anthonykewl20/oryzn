import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { verifyGitHubSignature } from "./signature";

const secret = "test-webhook-secret";
const rawBody = '{"action":"edited","spacing": "preserved"}\n';

function sign(body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

describe("verifyGitHubSignature", () => {
  it("accepts a valid signature", () => {
    expect(
      verifyGitHubSignature({ secret, rawBody, signatureHeader: sign(rawBody) }),
    ).toBe(true);
  });

  it("rejects a tampered body", () => {
    expect(
      verifyGitHubSignature({
        secret,
        rawBody: `${rawBody}tampered`,
        signatureHeader: sign(rawBody),
      }),
    ).toBe(false);
  });

  it("rejects a missing signature", () => {
    expect(verifyGitHubSignature({ secret, rawBody, signatureHeader: null })).toBe(false);
  });

  it("rejects a signature without the sha256 prefix", () => {
    expect(
      verifyGitHubSignature({
        secret,
        rawBody,
        signatureHeader: sign(rawBody).slice("sha256=".length),
      }),
    ).toBe(false);
  });

  it("safely rejects a signature with a different length", () => {
    expect(
      verifyGitHubSignature({
        secret,
        rawBody,
        signatureHeader: `${sign(rawBody)}00`,
      }),
    ).toBe(false);
  });
});
