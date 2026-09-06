import assert from "node:assert/strict";
import test from "node:test";
import { isDuplicateCandidate, isWithinHorizon, normalizeResearchText } from "./duplicate.ts";
import type { ResearchCandidate } from "./candidate.ts";

const candidate = (overrides: Partial<ResearchCandidate> = {}): ResearchCandidate => ({ title: "AIESEC Youth Summit", organizationName: "AIESEC Sri Lanka", description: "A current public opportunity for youth representation.", category: "youth_forum", representationType: "speaking", eventDate: "2026-11-20", applicationDeadline: "2026-10-20", location: "Colombo", eventUrl: "https://example.com/summit", sources: [{ name: "Official event page", url: "https://example.com/summit" }], recommendationSummary: "Strong visibility opportunity.", evidenceSummary: "The official event page lists the forum and participation details.", relevanceScore: 80, visibilityScore: 75, networkingScore: 70, stakeholderValueScore: 65, feasibilityScore: 85, ...overrides });

test("normalizes text and identifies exact URL or title/organization/date duplicates", () => {
  assert.equal(normalizeResearchText("AIESEC — Youth Summit!"), "aiesec youth summit");
  assert.equal(isDuplicateCandidate(candidate(), [{ title: "Different event", eventDate: "2026-10-01", urls: ["https://example.com/summit"] }]), true);
  assert.equal(isDuplicateCandidate(candidate({ eventUrl: null, sources: [{ name: "Official", url: "https://example.com/other" }] }), [{ title: "AIESEC Youth Summit", organizationName: "AIESEC Sri Lanka", eventDate: "2026-11-20", urls: [] }]), true);
});

test("accepts current candidates and rejects stale or undated candidates", () => {
  assert.equal(isWithinHorizon(candidate(), "2026-09-06", "2027-03-06"), true);
  assert.equal(isWithinHorizon(candidate({ eventDate: "2026-08-01" }), "2026-09-06", "2027-03-06"), false);
  assert.equal(isWithinHorizon(candidate({ eventDate: null, applicationDeadline: null }), "2026-09-06", "2027-03-06"), false);
});
