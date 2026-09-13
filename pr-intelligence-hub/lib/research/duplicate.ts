import type { ResearchCandidate } from "./candidate";

export function normalizeResearchText(value: string | null | undefined) { return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
export function canonicalizeUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"].forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.toString();
  } catch { return value.trim().toLowerCase(); }
}
export function candidateFingerprint(candidate: Pick<ResearchCandidate, "title" | "organizationName" | "eventDate" | "applicationDeadline">) {
  return [normalizeResearchText(candidate.title), normalizeResearchText(candidate.organizationName), candidate.eventDate ?? candidate.applicationDeadline ?? "unknown"].join("|");
}
export function isWithinHorizon(candidate: ResearchCandidate, start: string, end: string) {
  if (candidate.eventDate && (candidate.eventDate < start || candidate.eventDate > end)) return false;
  if (candidate.applicationDeadline && candidate.applicationDeadline < start) return false;
  return Boolean(candidate.eventDate || candidate.applicationDeadline) && candidate.sources.length > 0;
}
export interface DuplicateRecord { title: string; organizationName?: string | null; eventDate?: string | null; urls: string[]; }
export function isDuplicateCandidate(candidate: ResearchCandidate, existing: DuplicateRecord[]) {
  const urls = new Set(candidate.sources.map((source) => canonicalizeUrl(source.url)).concat(candidate.eventUrl ? [canonicalizeUrl(candidate.eventUrl)] : []).filter(Boolean));
  const title = normalizeResearchText(candidate.title); const organization = normalizeResearchText(candidate.organizationName);
  return existing.some((record) => {
    if (record.urls.some((url) => urls.has(canonicalizeUrl(url)))) return true;
    return record.eventDate === candidate.eventDate && normalizeResearchText(record.title) === title && normalizeResearchText(record.organizationName) === organization;
  });
}
