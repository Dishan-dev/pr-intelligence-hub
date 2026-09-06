import type { ResearchCandidate } from "./candidate";

export function normalizeResearchText(value: string | null | undefined) { return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
export function isWithinHorizon(candidate: ResearchCandidate, start: string, end: string) {
  if (candidate.eventDate && (candidate.eventDate < start || candidate.eventDate > end)) return false;
  if (candidate.applicationDeadline && candidate.applicationDeadline < start) return false;
  return Boolean(candidate.eventDate || candidate.applicationDeadline) && candidate.sources.length > 0;
}
export interface DuplicateRecord { title: string; organizationName?: string | null; eventDate?: string | null; urls: string[]; }
export function isDuplicateCandidate(candidate: ResearchCandidate, existing: DuplicateRecord[]) {
  const urls = new Set(candidate.sources.map((source) => source.url.toLowerCase()).concat(candidate.eventUrl ? [candidate.eventUrl.toLowerCase()] : []));
  const title = normalizeResearchText(candidate.title); const organization = normalizeResearchText(candidate.organizationName);
  return existing.some((record) => {
    if (record.urls.some((url) => urls.has(url.toLowerCase()))) return true;
    return record.eventDate === candidate.eventDate && normalizeResearchText(record.title) === title && normalizeResearchText(record.organizationName) === organization;
  });
}
