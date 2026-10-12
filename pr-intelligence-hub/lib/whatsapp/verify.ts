import { createHmac, timingSafeEqual } from "node:crypto";

/** Verify Meta's raw-body X-Hub-Signature-256 without accepting malformed hex. */
export function verifyMetaSignature(body: string, signature: string | null, appSecret: string | undefined) {
  if (!appSecret || !signature || !/^sha256=[a-fA-F0-9]{64}$/.test(signature)) return false;
  const received = Buffer.from(signature.slice(7), "hex");
  const expected = createHmac("sha256", appSecret).update(body, "utf8").digest();
  return received.length === expected.length && timingSafeEqual(received, expected);
}
