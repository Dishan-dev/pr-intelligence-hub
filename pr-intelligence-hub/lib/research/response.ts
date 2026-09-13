import { ResearchResponseSchema, type ResearchCandidate } from "./candidate";

function normalizedDate(value: unknown) {
  if (typeof value !== "string") return value;
  const exact = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (exact) return value;
  const embedded = value.match(/\b\d{4}-\d{2}-\d{2}\b/);
  return embedded?.[0] ?? null;
}

export function parseResearchResponse(text: string): ResearchCandidate[] {
  const json = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const payload = JSON.parse(json) as { candidates?: Array<Record<string, unknown>> };
  const candidates = (payload.candidates ?? []).map((candidate) => ({
    ...candidate,
    eventDate: normalizedDate(candidate.eventDate),
    applicationDeadline: normalizedDate(candidate.applicationDeadline),
  }));
  return ResearchResponseSchema.parse({ ...payload, candidates }).candidates;
}
