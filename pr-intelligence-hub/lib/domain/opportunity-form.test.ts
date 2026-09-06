import assert from "node:assert/strict";
import test from "node:test";

import { parseOpportunityForm } from "./opportunity-form.ts";

function formData(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    title: "Regional Youth Forum", organizationId: "", description: "", category: "conference",
    representationType: "speaking", eventDate: "2026-10-01", applicationDeadline: "2026-09-15",
    location: "Colombo", eventUrl: "https://example.com/event", source: "Partner email",
    sourceUrl: "https://example.com/source", status: "discovered", relevanceScore: "80",
    visibilityScore: "70", networkingScore: "60", stakeholderValueScore: "50", feasibilityScore: "90", notes: "",
    ...overrides,
  };
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, value));
  return data;
}

test("parses a valid opportunity form into typed persistence values", () => {
  const result = parseOpportunityForm(formData());
  assert.ok(result.data);
  assert.equal(result.data.relevanceScore, 80);
  assert.equal(result.data.eventUrl, "https://example.com/event");
  assert.equal(result.data.category, "conference");
});

test("rejects invalid scores, URLs, and missing titles", () => {
  const result = parseOpportunityForm(formData({ title: "", feasibilityScore: "100.5", eventUrl: "ftp://example.com" }));
  assert.equal(result.data, undefined);
  assert.equal(result.errors.fieldErrors?.title, "Title is required.");
  assert.equal(result.errors.fieldErrors?.feasibilityScore, "Use a whole number from 0 to 100.");
  assert.equal(result.errors.fieldErrors?.eventUrl, "Enter a valid http(s) URL.");
});
