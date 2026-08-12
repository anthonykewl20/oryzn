import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyGitHubSignature(opts: {
  secret: string;
  rawBody: string;
  signatureHeader: string | null;
}): boolean {
  const { secret, rawBody, signatureHeader } = opts;

  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(signatureHeader);

  if (expectedBuffer.length !== suppliedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, suppliedBuffer);
}
