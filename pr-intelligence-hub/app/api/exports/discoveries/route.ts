import { getDiscoveries, type DiscoveryFilters } from "@/lib/data/discoveries";
import { DISCOVERY_STATUSES, type DiscoveryStatus } from "@/lib/domain/discovery";
import { OPPORTUNITY_CATEGORIES, OPPORTUNITY_PRIORITIES, REPRESENTATION_TYPES, type OpportunityCategory, type OpportunityPriority, type RepresentationType } from "@/lib/domain/opportunity";
import { createAdminClient } from "@/lib/supabase/admin";

function valid<T extends readonly string[]>(value: string | null, options: T) {
  return value && options.includes(value) ? value as T[number] : undefined;
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request: Request) {
  const supabase = createAdminClient();
  const params = new URL(request.url).searchParams;
  const filters: DiscoveryFilters = {
    status: valid(params.get("status"), DISCOVERY_STATUSES) as DiscoveryStatus | undefined,
    category: valid(params.get("category"), OPPORTUNITY_CATEGORIES) as OpportunityCategory | undefined,
    representationType: valid(params.get("representationType"), REPRESENTATION_TYPES) as RepresentationType | undefined,
    priority: valid(params.get("priority"), OPPORTUNITY_PRIORITIES) as OpportunityPriority | undefined,
    sort: valid(params.get("sort"), ["score", "deadline", "event", "newest"] as const),
  };
  const { items } = await getDiscoveries(filters, { page: 1, pageSize: 10000 }, supabase);
  const headers = ["ID", "Title", "Organization", "Category", "Representation", "Status", "Event date", "Deadline", "Score", "Priority", "Source", "Source URL"];
  const rows = items.map((item) => [item.id, item.title, item.organizationName, item.category, item.representationType, item.discoveryStatus, item.eventDate, item.applicationDeadline, item.overallScore, item.priority, item.sourceName, item.sourceUrl]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  return new Response(`\ufeff${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=discoveries.csv" } });
}
