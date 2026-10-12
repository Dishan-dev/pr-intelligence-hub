import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyMetaSignature } from "./verify.ts";

test("accepts a correctly signed Meta webhook", () => {
  const body = JSON.stringify({ entry: [{ changes: [] }] });
  const signature = "sha256=" + createHmac("sha256", "test-secret").update(body).digest("hex");
  assert.equal(verifyMetaSignature(body, signature, "test-secret"), true);
});

test("rejects tampering, wrong secrets, missing and malformed signatures", () => {
  const body = '{"entry":[]}';
  const signature = "sha256=" + createHmac("sha256", "test-secret").update(body).digest("hex");
  assert.equal(verifyMetaSignature(body + " ", signature, "test-secret"), false);
  assert.equal(verifyMetaSignature(body, signature, "wrong-secret"), false);
  assert.equal(verifyMetaSignature(body, null, "test-secret"), false);
  assert.equal(verifyMetaSignature(body, "sha256=zz", "test-secret"), false);
  assert.equal(verifyMetaSignature(body, signature, undefined), false);
});
