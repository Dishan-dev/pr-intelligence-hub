import { canonicalizeUrl, normalizeResearchText } from "@/lib/research/duplicate";

export type ExistingDiscovery = {
  id: string;
  title: string;
  organization_name: string | null;
  event_date: string | null;
  event_url: string | null;
  source_url: string | null;
};
export type IncomingDiscovery = {
  title: string;
  organizationName: string | null;
  eventDate: string | null;
  eventUrl: string | null;
};

/** Unknown dates are not enough evidence to identify two otherwise similar posts as duplicates. */
export function findDuplicateDiscovery(candidate: IncomingDiscovery, existing: ExistingDiscovery[]) {
  const candidateUrl = canonicalizeUrl(candidate.eventUrl);
  const title = normalizeResearchText(candidate.title);
  const organizer = normalizeResearchText(candidate.organizationName);
  return existing.find((item) => {
    const urls = [item.event_url, item.source_url].map(canonicalizeUrl);
    if (candidateUrl && urls.includes(candidateUrl)) return true;
    return Boolean(candidate.eventDate && item.event_date === candidate.eventDate &&
      title && normalizeResearchText(item.title) === title &&
      organizer && normalizeResearchText(item.organization_name) === organizer);
  });
}
