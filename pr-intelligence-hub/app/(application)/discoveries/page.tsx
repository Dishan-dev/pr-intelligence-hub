import Link from "next/link";
import { Suspense } from "react";
import { Inbox, SlidersHorizontal } from "lucide-react";

import { OpportunityPriorityBadge } from "@/components/opportunity-badge";
import { PageEmptyState } from "@/components/page-empty-state";
import { Button } from "@/components/ui/button";
import { getDiscoveries, type DiscoveryFilters } from "@/lib/data/discoveries";
import { getLatestResearchRun } from "@/lib/data/research-runs";
import { RunResearchButton } from "@/components/run-research-button";
import {
  DISCOVERY_STATUSES,
  DISCOVERY_STATUS_LABELS,
  type DiscoveryStatus,
} from "@/lib/domain/discovery";
import {
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_CATEGORY_LABELS,
  OPPORTUNITY_PRIORITIES,
  OPPORTUNITY_PRIORITY_LABELS,
  REPRESENTATION_TYPES,
  REPRESENTATION_TYPE_LABELS,
  type OpportunityCategory,
  type OpportunityPriority,
  type RepresentationType,
} from "@/lib/domain/opportunity";

export const metadata = { title: "Discoveries" };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;
function option<T extends readonly string[]>(
  value: string | undefined,
  options: T,
): T[number] | undefined {
  return value && options.includes(value) ? (value as T[number]) : undefined;
}
function date(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(
        new Date(`${value}T00:00:00`),
      )
    : "—";
}

async function DiscoveryInbox({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const requestedPage = Number(one(query.page));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const filters: DiscoveryFilters = {
    status: option(one(query.status), DISCOVERY_STATUSES) as
      | DiscoveryStatus
      | undefined,
    category: option(one(query.category), OPPORTUNITY_CATEGORIES) as
      | OpportunityCategory
      | undefined,
    representationType: option(
      one(query.representationType),
      REPRESENTATION_TYPES,
    ) as RepresentationType | undefined,
    priority: option(one(query.priority), OPPORTUNITY_PRIORITIES) as
      | OpportunityPriority
      | undefined,
    sort: option(one(query.sort), [
      "score",
      "deadline",
      "event",
      "newest",
    ] as const),
  };
  const [{ items: discoveries, total, page: currentPage, pageSize }, latestRun] = await Promise.all([
    getDiscoveries(filters, { page, pageSize: 8 }),
    getLatestResearchRun(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (key !== "page" && typeof value === "string") params.set(key, value);
    });
    if (targetPage > 1) params.set("page", String(targetPage));
    const queryString = params.toString();
    return queryString ? `/discoveries?${queryString}` : "/discoveries";
  };
  const filtered = Boolean(
    filters.status ||
      filters.category ||
      filters.representationType ||
      filters.priority,
  );
  const exportParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (key !== "page" && typeof value === "string") exportParams.set(key, value);
  });
  const exportHref = `/api/exports/discoveries${exportParams.toString() ? `?${exportParams.toString()}` : ""}`;
  const control =
    "rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-emerald-500";
  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center backdrop-blur-sm">
        <div>
          <p className="text-sm font-semibold text-white">
            Automated opportunity research
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Finds high-value routes for AIESEC to represent itself externally.
          </p>
          {latestRun && (
            <>
              <p className="mt-2 text-xs text-slate-500">
                Latest run:{" "}
                <span className="font-medium text-slate-300">
                  {latestRun.status}
                </span>{" "}
                · {latestRun.candidateCount} candidates ·{" "}
                {latestRun.insertedCount} new · {latestRun.duplicateCount}{" "}
                duplicates skipped · {latestRun.rejectedCount} rejected
              </p>
              {latestRun.status === "failed" && latestRun.errorMessage && (
                <p className="mt-2 max-w-xl text-xs leading-5 text-rose-400">
                  {latestRun.errorMessage}
                </p>
              )}
            </>
          )}
        </div>
        <RunResearchButton />
      </div>
      <nav
        className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-800"
        aria-label="Discovery categories"
      >
        <Link
          href="/discoveries"
          aria-current={!filters.category ? "page" : undefined}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${!filters.category ? "border-emerald-400 text-emerald-400" : "border-transparent text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}
        >
          All
        </Link>
        {OPPORTUNITY_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/discoveries?category=${category}`}
            aria-current={filters.category === category ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${filters.category === category ? "border-emerald-400 text-emerald-400" : "border-transparent text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}
          >
            {OPPORTUNITY_CATEGORY_LABELS[category]}
          </Link>
        ))}
      </nav>
      <form
        action="/discoveries"
        className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 backdrop-blur-sm"
      >
        <SlidersHorizontal className="size-4 text-slate-500" />
        <select
          className={control}
          name="status"
          defaultValue={filters.status ?? ""}
        >
          <option value="">All statuses</option>
          {DISCOVERY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {DISCOVERY_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          className={control}
          name="representationType"
          defaultValue={filters.representationType ?? ""}
        >
          <option value="">All purposes</option>
          {REPRESENTATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {REPRESENTATION_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <select
          className={control}
          name="priority"
          defaultValue={filters.priority ?? ""}
        >
          <option value="">All priorities</option>
          {OPPORTUNITY_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {OPPORTUNITY_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
        <select
          className={control}
          name="sort"
          defaultValue={filters.sort ?? "newest"}
        >
          <option value="newest">Newest discoveries</option>
          <option value="score">Highest score</option>
          <option value="deadline">Nearest deadline</option>
          <option value="event">Nearest event date</option>
        </select>
        <Button type="submit" variant="outline">
          Apply
        </Button>
        {filtered && (
          <Button asChild variant="ghost">
            <Link href="/discoveries">Clear</Link>
          </Button>
        )}
      </form>
      <div className="mb-5 flex justify-end">
        <Link href={exportHref} className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white">
          Export all CSV
        </Link>
      </div>
      {discoveries.length === 0 ? (
        <PageEmptyState
          icon={Inbox}
          title={
            filtered
              ? "No discoveries match these filters"
              : "Discovery inbox is clear"
          }
          description={
            filtered
              ? "Try a different review filter."
              : "Run research when you are ready to collect public opportunities."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-800/60 text-xs font-medium uppercase tracking-wide text-slate-400">
              <tr>
                <th className="w-[52%] px-3 py-3 sm:w-[34%] sm:px-4">Discovery</th>
                <th className="hidden px-4 py-3 md:table-cell md:w-[16%]">Category</th>
                <th className="hidden px-4 py-3 lg:table-cell lg:w-[12%]">Event</th>
                <th className="hidden px-4 py-3 lg:table-cell lg:w-[12%]">Deadline</th>
                <th className="w-[18%] px-3 py-3 sm:w-[12%] sm:px-4">Score</th>
                <th className="w-[30%] px-3 py-3 sm:w-[18%] sm:px-4">Priority</th>
                <th className="hidden px-4 py-3 xl:table-cell xl:w-[16%]">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {discoveries.map((discovery) => (
                <tr
                  key={discovery.id}
                  className="align-middle transition hover:bg-slate-800/50"
                >
                  <td className="max-w-0 px-3 py-3 sm:px-4">
                    <Link
                      href={`/discoveries/${discovery.id}`}
                      className="block break-words font-medium text-white transition-colors hover:text-emerald-400"
                    >
                      {discovery.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {discovery.organizationName ?? "Organization not identified"}
                    </p>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-slate-400 md:table-cell">
                    {discovery.category
                      ? OPPORTUNITY_CATEGORY_LABELS[discovery.category]
                      : "Uncategorized"}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-slate-400 lg:table-cell">
                    {date(discovery.eventDate)}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-slate-400 lg:table-cell">
                    {date(discovery.applicationDeadline)}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-300 sm:px-4">
                    {discovery.overallScore?.toFixed(1) ?? "—"}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <OpportunityPriorityBadge priority={discovery.priority} />
                  </td>
                  <td className="hidden max-w-40 px-4 py-3 text-slate-400 xl:table-cell">
                    {discovery.sourceName ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <nav className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between" aria-label="Discovery pagination">
          <p className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2 self-end sm:self-auto">
            {currentPage > 1 ? (
              <Button asChild variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                <Link href={pageHref(currentPage - 1)}>Previous</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled className="border-slate-800 bg-slate-900 text-slate-600">Previous</Button>
            )}
            {currentPage < totalPages ? (
              <Button asChild variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                <Link href={pageHref(currentPage + 1)}>Next</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled className="border-slate-800 bg-slate-900 text-slate-600">Next</Button>
            )}
          </div>
        </nav>
      )}
    </>
  );
}

export default function DiscoveriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <section>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Research review</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
          Discovery inbox
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Review researched opportunities before they become part of the
          official pipeline.
        </p>
      </div>
      <Suspense
        fallback={
          <div
            className="h-72 animate-pulse rounded-xl bg-slate-800/50"
            aria-busy="true"
          />
        }
      >
        <DiscoveryInbox searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
