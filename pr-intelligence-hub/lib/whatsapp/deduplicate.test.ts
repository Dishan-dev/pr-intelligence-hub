import test from "node:test";
import assert from "node:assert/strict";
import { findDuplicateDiscovery } from "./deduplicate.ts";

const record = { id: "one", title: "Youth Summit", organization_name: "AIESEC", event_date: "2026-11-01", event_url: "https://example.com/event?utm_source=wa", source_url: null };

test("deduplicates tracking variants of an event URL", () => {
  assert.equal(findDuplicateDiscovery({ title: "Another title", organizationName: null, eventDate: null, eventUrl: "https://example.com/event" }, [record])?.id, "one");
});
test("deduplicates same event title, organizer and date", () => {
  assert.equal(findDuplicateDiscovery({ title: "Youth Summit", organizationName: "AIESEC", eventDate: "2026-11-01", eventUrl: null }, [record])?.id, "one");
});
test("does not collapse unknown-date submissions solely by title", () => {
  assert.equal(findDuplicateDiscovery({ title: "Youth Summit", organizationName: "AIESEC", eventDate: null, eventUrl: null }, [{ ...record, event_date: null }]), undefined);
});
